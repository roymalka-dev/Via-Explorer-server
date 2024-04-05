import { addNewAppController } from "../../controllers/app.controllers";
import { EndpointType, RouteType } from "types/routes.types";
import { appEndpoints } from "./app.endpoints.config";
import { authenticator } from "../../middleware/authenticator";
import { userEndpoints } from "./user.endpoints.config";
import { configurationsEndpoints } from "./configurations.endpoints";
import { requestsEndpoints } from "./requests.endpoints.config";

export const routes: RouteType[] = [
  /**
   * Route configuration for the 'app' section of the API.
   * This route group is prefixed with '/app' and includes various endpoints related to app operations.
   * Each endpoint within this group is protected by the 'authenticator' middleware, requiring valid authentication.
   */
  {
    name: "app",
    path: "/app",
    endpoints: appEndpoints,
    middleware: [authenticator],
  },

  /**
   * Route configuration for the 'user' section of the API.
   * This route group is prefixed with '/user' and encompasses endpoints related to user management and operations.
   * Access to these endpoints is secured with the 'authenticator' middleware, ensuring only authenticated users can interact with them.
   */
  {
    name: "user",
    path: "/user",
    endpoints: userEndpoints,
    middleware: [authenticator],
  },
  /**
   * Route configuration for handling various requests, prefixed with '/requests'.
   * The 'requests' group includes endpoints for operations like fetching presigned URLs for S3 or submitting new app requests.
   * The 'authenticator' middleware is applied to all endpoints within this group, requiring user authentication.
   */
  {
    name: "requests",
    path: "/requests",
    endpoints: requestsEndpoints,
    middleware: [authenticator],
  },
  /**
   * Route configuration for the 'configurations' section of the API.
   * This group, accessible via '/configurations', contains endpoints for managing app configuration settings.
   * All endpoints in this group are protected by the 'authenticator' middleware, typically requiring administrative access.
   */
  {
    name: "configurations",
    path: "/configurations",
    endpoints: configurationsEndpoints,
    middleware: [authenticator],
  },
];
