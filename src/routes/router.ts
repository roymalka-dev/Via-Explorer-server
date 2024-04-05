import { Application } from "express";
import { RouteType } from "types/routes.types";
import { createEndpoints } from "./endpoint";

/**
 * Configures and registers routes with the provided Express application.
 * Each route is prefixed and combined with its sub-endpoints to create fully qualified paths.
 * Middleware specific to each route is applied before the endpoints' handlers.
 *
 * @param {string} prefix - A common prefix to prepend to all routes, useful for namespacing (e.g., '/api/v1').
 * @param {Application} app - The Express application instance to which the routes will be registered.
 * @param {RouteType[]} routes - An array of route configurations, each including a path, optional middleware, and endpoints.
 */
export const router = (
  prefix: string,
  app: Application,
  routes: RouteType[]
) => {
  try {
    routes.forEach((route) => {
      const fullPath = `/${prefix}${route.path}`;
      app.use(
        fullPath,
        ...route.middleware,
        createEndpoints(route.path, route.endpoints)
      );
    });
  } catch (error) {
    console.error(error);
  }
};
