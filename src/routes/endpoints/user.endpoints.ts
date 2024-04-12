import { validateRequest } from "../../middleware/validator";
import {
  editUserDetailsController,
  getAllUsersController,
  getUserDetailsController,
  getUserFavoritesController,
  getUserRecentlyViewedController,
  getUserRequestsController,
  toggleUserFavoriteController,
} from "../../controllers/user.controllers";
import { EndpointType } from "../../types/routes.types";
import { appValidationParamsSchema } from "../../validations/app.validations";
/**
 * Endpoints related to requests within the application.
 *
 * @type {EndpointType[]} userEndpoints
 */
export const userEndpoints: EndpointType[] = [
  /**
   * Endpoint configuration for retrieving the details of the currently authenticated user.
   *
   * This endpoint is designed to fetch and return detailed information about the user currently logged into the system.
   * It is a GET request that does not require any additional parameters or request body content, relying instead on session
   * data to identify the user. The endpoint uses the `getUserDetailsController` to process the request.
   *
   * No middleware is applied, so the request proceeds directly to the controller. Access to this endpoint is restricted to users
   * with 'USER' authority, ensuring that only authenticated users can retrieve their own information.
   */
  {
    name: "get user details",
    method: "get",
    path: "/get-user-details",
    controller: getUserDetailsController,
    middleware: [],
    authority: "USER",
  },

  /**
   * Endpoint configuration for editing user details.
   *
   * This PUT endpoint allows administrators to update user information. The request requires authentication and authorization,
   * with access restricted to users having 'ADMIN' authority. It processes user updates through the `editUserDetailsController`,
   * which handles data validation and database interactions.
   * Path: "/edit-user"
   * Authority Required: "ADMIN"
   */
  {
    name: "edit user details",
    method: "put",
    path: "/edit-user",
    controller: editUserDetailsController,
    middleware: [],
    authority: "ADMIN",
  },

  /**
   * Endpoint configuration for retrieving a list of all users in the system.
   *
   * Designed for administrative purposes, this endpoint allows for fetching comprehensive details of all users registered
   * in the application. It is a GET request that does not require any request body or query parameters, and it utilizes the
   * `getAllUsersController` to handle the request logic.
   *
   * No middleware is applied to this endpoint, allowing direct processing by the controller. However, access is restricted
   * to users with 'ADMIN' authority level to ensure sensitive user information remains secure and accessible only to
   * authorized personnel.
   */
  {
    name: "get all users",
    method: "get",
    path: "/get-all-users",
    controller: getAllUsersController,
    middleware: [],
    authority: "ADMIN",
  },

  /**
   * Endpoint configuration for retrieving a user's favorite items.
   *
   * This endpoint allows users to fetch a list of their favorite items, such as apps or services, that they've marked as favorites.
   * It is a GET request and relies on session data to identify the requesting user, therefore it does not require additional parameters
   * or request body content. The `getUserFavoritesController` is tasked with handling the request logic.
   *
   * The endpoint does not use middleware for pre-processing requests, but it enforces a 'USER' authority level, ensuring that only
   * authenticated users can access their own list of favorites.
   */
  {
    name: "get user favorites",
    method: "get",
    path: "/get-user-favorites",
    controller: getUserFavoritesController,
    middleware: [],
    authority: "USER",
  },
  /**
   * Endpoint configuration for toggling a user's favorite item status.
   *
   * This endpoint allows users to add or remove an item from their list of favorites. It expects a POST request
   * with the ID of the item to be toggled provided as a URL parameter. The `toggleUserFavoriteController` is responsible
   * for handling the logic of toggling the favorite status of the specified item for the authenticated user.
   *
   * The request is validated using the `validateRequest` middleware along with `appValidationParamsSchema` to ensure
   * the required `id` parameter is present and correctly formatted. This validation helps prevent processing requests
   * with malformed or missing item IDs.
   *
   * Access to this endpoint is restricted to users with 'USER' authority level, ensuring that only authenticated users
   * can toggle the favorite status of items.
   */
  {
    name: "toggle user favorites",
    method: "post",
    path: "/toggle-user-favorite/:id",
    controller: toggleUserFavoriteController,
    middleware: [validateRequest(appValidationParamsSchema, "params")],
    authority: "USER",
  },
  /**
   * Endpoint configuration for retrieving a list of apps that the user has recently viewed.
   *
   * This endpoint is designed to enhance the user experience by allowing users to quickly access apps they have shown interest in recently.
   * It is a GET request that relies on session data to identify the requesting user, therefore it does not require additional parameters
   * or request body content. The `getUserRecentlyViewedController` is tasked with handling the request logic.
   *
   * The endpoint does not employ middleware for pre-processing requests, but it enforces a 'USER' authority level, ensuring that only
   * authenticated users can access their own recently viewed apps list.
   */
  {
    name: "get user recently viewed",
    method: "get",
    path: "/get-user-recently-viewed",
    controller: getUserRecentlyViewedController,
    middleware: [],
    authority: "USER",
  },
  /**
   * Endpoint configuration for retrieving a list of requests made by the currently authenticated user.
   *
   * This endpoint is designed to provide users with an overview of all the requests they have submitted, enhancing transparency and user engagement.
   * It is a GET request that leverages session data to identify the requesting user, hence it does not necessitate additional parameters or request body content.
   * The `getUserRequestsController` is responsible for orchestrating the request logic.
   *
   * There are no middleware functions applied to this endpoint, allowing for a straightforward request flow. However, access is restricted to authenticated users,
   * ensuring personal data protection by enforcing a 'USER' authority level requirement.
   */
  {
    name: "get user requests",
    method: "get",
    path: "/get-user-requests",
    controller: getUserRequestsController,
    middleware: [],
    authority: "USER",
  },
];
