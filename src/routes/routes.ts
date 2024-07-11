import { authenticator } from "../middleware/authenticator";
import { appEndpoints } from "./endpoints/app.endpoints";
import { configurationsEndpoints } from "./endpoints/configurations.endpoints";
import { requestsEndpoints } from "./endpoints/requests.endpoints";
import { userEndpoints } from "./endpoints/user.endpoints";
import { RouteType } from "../types/routes.types";
import { redisGetRequestCache } from "../middleware/redis";
import { siteEndpoints } from "./endpoints/site.endpoints";
import { authEndpoints } from "./endpoints/auth.endpoints";
import { logsEndpoints } from "./endpoints/logs.endpoints";
import { testEndpoints } from "./endpoints/test.endpoints";
import { publicEndpoints } from "./endpoints/public.endpoints";

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
    middleware: [authenticator, redisGetRequestCache],
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
    middleware: [authenticator, redisGetRequestCache],
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
    middleware: [authenticator, redisGetRequestCache],
  },

  /**
   * Route configuration for the 'site' section of the API.
   * This group, accessible via '/site', contains endpoints for managing site settings.
   * All endpoints in this group are protected by the 'authenticator' middleware, typically requiring administrative access.
   * The 'redisGetRequestCache' middleware is also applied to cache requests.
   */
  {
    name: "site",
    path: "/site",
    endpoints: siteEndpoints,
    middleware: [authenticator],
  },
  /**
   * Route configuration for the 'auth' section of the API.
   * This group, accessible via '/auth', contains endpoints for user authentication and authorization.
   * All endpoints in this group are protected by the 'authenticator' middleware, ensuring proper authentication.
   */
  {
    name: "auth",
    path: "/auth",
    endpoints: authEndpoints,
    middleware: [authenticator],
  },
  /**
   * Route configuration for the 'logs' section of the API.
   * This group, accessible via '/logs', contains endpoints for retrieving log data.
   * All endpoints in this group are protected by the 'authenticator' middleware, ensuring proper authentication.
   */
  {
    name: "logs",
    path: "/logs",
    endpoints: logsEndpoints,
    middleware: [authenticator],
  },
  {
    name: "public",
    path: "/public",
    endpoints: publicEndpoints,
    middleware: [],
  },

  {
    name: "test",
    path: "/test",
    endpoints: testEndpoints,
    middleware: [],
  },
];
