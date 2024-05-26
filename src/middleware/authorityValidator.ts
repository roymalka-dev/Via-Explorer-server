import { RequestHandler } from "express";
import { validateUserAuth } from "../utils/auth.utils";
import { stat } from "fs-extra";

export const authorityValidator = (
  requiredAuthority: string
): RequestHandler => {
  return (req, res, next) => {
    try {
      // Ensure the session exists
      if (!req.session || !req.session.user || !req.session.authorization) {
        return res.status(401).send({ error: "Unauthorized", status: 401 });
      }

      // Check if the user's authority matches the required authority
      if (!validateUserAuth(requiredAuthority, req.session.authorization)) {
        return res
          .status(403)
          .send({ error: "Insufficient authority", status: 403 });
      }

      // If the user has the required authority, proceed to the next middleware
      next();
    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  };
};
