import { authControllers } from "../../controllers/auth.controllers";
import { EndpointType } from "types/routes.types";

/**
 * Endpoints related to authentication within the application.
 *
 * @type {EndpointType[]} authEndpoints
 */
export const authEndpoints: EndpointType[] = [
  /**
   * Controller for verifying user authentication.
   *
   * This controller handles an HTTP GET request to verify that the user is authenticated.
   * It sends a response with a 200 status code and a message indicating that the user is authenticated.
   * the authenciaction is done by the authenticator middleware.
   *
   * @param {Request} req - The Express request object. This function does not use any request parameters.
   * @param {Response} res - The Express response object used to send back a message indicating that the user is authenticated.
   */
  {
    name: "verify-user",
    method: "get",
    path: "/verify-user",
    controller: authControllers.verify,
    middleware: [],
    authority: "USER",
  },
  /**
   * Controller for verifying admin authentication.
   *
   * This controller handles an HTTP GET request to verify that the admin is authenticated.
   * It sends a response with a 200 status code and a message indicating that the user is authenticated.
   * the authenciaction is done by the authenticator middleware.
   *
   * @param {Request} req - The Express request object. This function does not use any request parameters.
   * @param {Response} res - The Express response object used to send back a message indicating that the user is authenticated.
   */
  {
    name: "verify-admin",
    method: "get",
    path: "/verify-admin",
    controller: authControllers.verify,
    middleware: [],
    authority: "ADMIN",
  },
  /**
   * Controller for logging out the user.
   *
   * This controller handles an HTTP GET request to log out the user.
   * It sends a response with a 200 status code and a message indicating that the user has been logged out.
   * the authenciaction is done by the authenticator middleware.
   *
   * @param {Request} req - The Express request object. This function does not use any request parameters.
   * @param {Response} res - The Express response object used to send back a message indicating that the user has been logged out.
   */
  {
    name: "logout",
    method: "post",
    path: "/logout",
    controller: authControllers.logout,
    middleware: [],
    authority: "USER",
  },
];
