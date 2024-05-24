import express, { RequestHandler } from "express";
import { EndpointType } from "types/routes.types";
import { authorityValidator } from "../middleware/authorityValidator";
/**
 * Dynamically creates and configures endpoints for an Express router based on the provided configurations.
 *
 * @param prefix - A prefix to prepend to all endpoint paths, useful for versioning or grouping endpoints.
 * @param endpoints - An array of endpoint configurations, each defining path, method, controller, and middleware (if any).
 * @returns An Express router with the configured endpoints.
 */
export const createEndpoints = (
  prefix: string,
  endpoints: EndpointType[]
): express.Router => {
  const router = express.Router();

  endpoints.forEach(({ path, method, controller, middleware, authority }) => {
    const middlewares: RequestHandler[] = Array.isArray(middleware)
      ? middleware
      : [];

    if (authority) {
      middlewares.unshift(authorityValidator(authority));
    }

    if (typeof router[method] === "function") {
      router[method](path, ...middlewares, controller);
    } else {
      console.warn(`Invalid method '${method}' for path '${path}'.`);
    }
  });

  return router;
};
