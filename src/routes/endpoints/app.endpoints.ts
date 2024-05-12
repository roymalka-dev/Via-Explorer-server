import {
  appValidationBodySchema,
  appValidationParamsSchema,
  appsByIdsValidationBodySchema,
  multipleAppsValidationBodySchema,
  searchValidationQuerySchema,
  updateAppValidationBodySchema,
} from "../../validations/app.validations";

import { appControllers } from "../../controllers/app.controllers";
import { EndpointType } from "../../types/routes.types";
import { validateRequest } from "../../middleware/validator";
/**
 * Endpoints related to apps within the application.
 *
 * @type {EndpointType[]} appEndpoints
 */
export const appEndpoints: EndpointType[] = [
  /**
   * Endpoint for adding a single app.
   * This endpoint expects a POST request with an application's data in the body.
   * It uses the `addNewAppController` to handle the request logic.
   * The request body is validated against the `appValidationBodySchema`.
   * Requires USER authority level to access.
   */
  {
    name: "add app",
    method: "post",
    path: "/add-app",
    controller: appControllers.addNewAppController,
    middleware: [validateRequest(appValidationBodySchema, "body")],
    authority: "USER",
  },

  /**
   * Endpoint for updating an existing app.
   * This endpoint expects a PUT request with the updated app data in the body.
   * It uses the `updateAppController` to handle the request logic.
   * No request validation middleware is required.
   * Requires ADMIN authority level to access.
   */
  {
    name: "update app",
    method: "put",
    path: "/update-app",
    controller: appControllers.updateAppController,
    middleware: [validateRequest(updateAppValidationBodySchema, "body")],
    authority: "ADMIN",
  },

  /**
   * Endpoint for adding multiple apps in a single request.
   * This endpoint expects a POST request with an array of application data in the body.
   * It uses the `addMultipleAppsController` to process the batch addition of apps.
   * The request body is validated against the `multipleAppsValidationBodySchema`.
   * Requires USER authority level to access.
   */
  {
    name: "add multiple apps",
    method: "post",
    path: "/add-multiple-apps",
    controller: appControllers.addMultipleAppsController,
    middleware: [validateRequest(multipleAppsValidationBodySchema, "body")],
    authority: "USER",
  },

  /**
   * Endpoint for retrieving the details of a single app by its ID.
   * This endpoint expects a GET request with the app ID provided as a URL parameter.
   * It uses the `getAppController` to fetch and return the app's details.
   * The URL parameter is validated against the `appValidationParamsSchema`.
   * Requires USER authority level to access.
   */
  {
    name: "get app",
    method: "get",
    path: "/get-app/:id",
    controller: appControllers.getAppController,
    middleware: [validateRequest(appValidationParamsSchema, "params")],
    authority: "USER",
  },

  /**
   * Endpoint for retrieving a list of all apps.
   * This endpoint expects a GET request without any parameters.
   * It uses the `getAllAppsController` to fetch and return details of all apps.
   * No request validation middleware is required.
   * Requires USER authority level to access.
   */
  {
    name: "get all apps",
    method: "get",
    path: "/get-all-apps",
    controller: appControllers.getAllAppsController,
    middleware: [],
    authority: "USER",
  },

  /**
   * Endpoint for retrieving details of multiple apps by their IDs.
   * This endpoint expects a POST request with an array of app IDs in the body.
   * It uses the `getAppsByIds` controller to fetch and return details of the specified apps.
   * The request body is validated against the `appsByIdsValidationBodySchema`.
   * Requires USER authority level to access.
   */
  {
    name: "get apps by ids",
    method: "post",
    path: "/get-apps-by-ids",
    controller: appControllers.getAppsByIds,
    middleware: [validateRequest(appsByIdsValidationBodySchema, "body")],
    authority: "USER",
  },

  /**
   * Endpoint for searching apps based on a query.
   * This endpoint expects a GET request with a search query as a query parameter.
   * It uses the `searchAppsController` to search and return matching apps.
   * The search query is validated against the `searchValidationQuerySchema`.
   * Requires USER authority level to access.
   */
  {
    name: "search apps",
    method: "get",
    path: "/search-apps",
    controller: appControllers.searchAppsController,
    middleware: [validateRequest(searchValidationQuerySchema, "query")],
    authority: "USER",
  },

  /**
   * Route configuration for updating multiple applications in the database.
   *
   * This route allows for batch updating of application data by sending a POST request with a payload
   * containing an array of application objects. Each object in the array should include the application ID
   * and the attributes to be updated. The operation is restricted to users with ADMIN authority.
   *
   * The route expects no middleware to be applied. In a real-world application, you might want to include
   * middleware for tasks such as authentication, logging, or request validation.
   */
  {
    name: "update multiple apps",
    method: "post",
    path: "/update-multiple-apps",
    controller: appControllers.updateMultipleAppsController,
    middleware: [],
    authority: "ADMIN",
  },
];
