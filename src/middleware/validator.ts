import { RequestHandler } from "express";
import * as yup from "yup";

/**
 * Creates a middleware for validating request data against a provided Yup schema.
 *
 * @param schema The Yup validation schema.
 * @param property The part of the request to validate (e.g., 'body', 'params', 'query').
 * @returns An Express middleware for request validation.
 */
export const validateRequest = (
  schema: yup.ObjectSchema<any, any, any, any>,
  property: "body" | "params" | "query"
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await schema.validate(req[property], { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res
          .status(400)
          .json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ error: "Server error during validation" });
      }
    }
  };
};
