import {
  appValidationBodySchema,
  appValidationParamsSchema,
  appsByIdsValidationBodySchema,
  multipleAppsValidationBodySchema,
  searchValidationQuerySchema,
} from "../../validations/app.validations";
import {
  addMultipleAppsController,
  addNewAppController,
  getAllAppsController,
  getAppController,
  getAppsByIds,
  searchAppsController,
} from "../../controllers/app.controllers";
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
    controller: addNewAppController,
    middleware: [validateRequest(appValidationBodySchema, "body")],
    authority: "USER",
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
    controller: addMultipleAppsController,
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
    controller: getAppController,
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
    controller: getAllAppsController,
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
    controller: getAppsByIds,
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
    controller: searchAppsController,
    middleware: [validateRequest(searchValidationQuerySchema, "query")],
    authority: "USER",
  },
];
