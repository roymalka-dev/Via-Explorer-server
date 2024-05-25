import { log } from "async";
import { Request, Response } from "express";
import logger from "../logger/logger";

export const authControllers = {
  verify: async (req: Request, res: Response) => {
    res.status(200).send({ message: "Authorized" });
  },
  logout: (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error("Failed to destroy session during logout", {
          tag: "error",
          location: "auth.controllers.ts",
          error: err.message,
        });
        return res.status(500).send("Failed to log out");
      }

      res.clearCookie("connect.sid", { path: "/" }); // Clear the session cookie

      return res.status(200).json({ message: "Logged out successfully" });
    });
  },
};
