import { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import { userService } from "../services/db.services/users.db.services"; // Import userService
import logger from "../logger/logger";

declare module "express-session" {
  interface SessionData {
    user: string;
    authorization: string;
  }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Middleware for authenticating users via Google OAuth2.
 *
 * This middleware intercepts incoming requests to verify the presence and validity of an OAuth2 token in the `Authorization` header.
 * It expects a "Bearer" token format. If the token is present and valid, it uses Google's OAuth2Client to verify the token against
 * the specified Google client ID. Upon successful verification, it extracts the user's email from the token payload.
 *
 * If the user's email is not already in the session, the middleware checks if the user exists in the database using `userService`.
 * If the user is found, their details are retained in the session; if not, a new user record is created, and the session is updated
 * accordingly.
 *
 * The middleware allows the request to proceed to the next handler if authentication is successful. If the authentication fails at any
 * point (missing or invalid token, token verification failure, email extraction failure), it responds with a 403 status code and an
 * error message.
 *
 * @param {Request} req - The Express request object, containing headers and session data.
 * @param {Response} res - The Express response object, used for sending back an authentication failure message.
 * @param {NextFunction} next - The callback to pass control to the next middleware function in the stack.
 */
export const authenticator: RequestHandler = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader)
      throw new Error("No authorization header provided");

    const [bearer, token] = authorizationHeader.split(" ");

    if (bearer !== "Bearer" || !token)
      throw new Error("Invalid authorization header format");

    if (req.session.user && req.session.authorization) {
      return next();
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("Email not found in token payload");
    }

    if (!req.session.user) {
      let user = await userService.getUserByEmail(payload.email);
      if (!user) {
        const payloadEmail = payload.email.split("@")[1];

        if (payloadEmail !== "ridewithvia.com") {
          throw new Error("Unauthorized domain");
        }

        const newUserDetails = {
          email: payload.email,
          authorization: "USER",
        };
        await userService.addUser(newUserDetails);

        logger.info(`New user Added: ${payload.email}`, {
          tag: "new-user",
          location: "authenticator.ts",
        });

        user = await userService.getUserByEmail(payload.email);
      }

      req.session.user = payload.email;
      req.session.authorization = user.authorization;

      req.session.save((error) => {
        if (error) {
          throw error;
        } else {
        }
      });
    }

    next();
  } catch (error) {
    logger.error("Authentication error", {
      tag: "error",
      location: "authenticator.ts",
      error: error.message,
    });
    res.status(403).send({ error: error.message });
  }
};
