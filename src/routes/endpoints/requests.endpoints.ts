import { validateRequest } from "../../middleware/validator";
import {
  createNewAppRequestController,
  deleteRequestByIdController,
  getAllRequestsController,
  getRequestByIdController,
  getS3PresignedUrlController,
  removeS3ObjectController,
  updateRequestStatusByIdController,
} from "../../controllers/requests.controllers";
import { EndpointType } from "../../types/routes.types";
import {
  appRequestValidationBodySchema,
  deleteS3ObjectalidationParamsSchema,
  getS3PresignedUrlValidationBodySchema,
} from "../../validations/requests.validations";

/**
 * Endpoints related to requests within the application.
 *
 * @type {EndpointType[]} requestsEndpoints
 */
export const requestsEndpoints: EndpointType[] = [
  /**
   * Endpoint for obtaining a presigned URL for AWS S3 upload operations.
   * This endpoint expects a POST request with details necessary to generate a presigned URL.
   * It uses the `getS3PresignedUrlController` to handle the request logic, which includes generating the presigned URL,
   * the final URL where the file will be accessible, and a hashed filename for storage purposes.
   *
   * The request body is validated against the `getS3PresignedUrlValidationBodySchema`, ensuring required fields
   * `bucketName`, `fileName`, and `fileType` are provided. If any of these fields are missing, a 400 status code
   * with an appropriate error message is returned.
   *
   * Successful requests will receive a 200 status code with the presigned URL, file URL, and hashed filename.
   * In case of an internal server error, a 500 status code with an error message is returned.
   *
   * Access to this endpoint is restricted to users with 'USER' authority level.
   */
  {
    name: "get s3 presigned url",
    method: "post",
    path: "/get-s3-presigned-url",
    controller: getS3PresignedUrlController,
    middleware: [
      validateRequest(getS3PresignedUrlValidationBodySchema, "body"),
    ],
    authority: "USER",
  },

  /**
   * Endpoint for removing an object from an S3 bucket.
   * This endpoint expects a DELETE request with `bucketName` and `fileName` as URL parameters to specify
   * the S3 bucket and the file name of the object to be removed. It uses the `removeS3ObjectController` to handle
   * the request logic.
   *
   * The URL parameters are validated against the `deleteS3ObjectValidationParamsSchema` to ensure they are provided.
   * If any parameter is missing, a 400 status code with an error message is returned.
   *
   * Requires USER authority level to access, ensuring that only authenticated users can remove objects from S3.
   */
  {
    name: "remove s3 object",
    method: "delete",
    path: "/remove-s3-object/:bucketName/:fileName",
    controller: removeS3ObjectController,
    middleware: [
      validateRequest(deleteS3ObjectalidationParamsSchema, "params"),
    ],
    authority: "USER",
  },

  /**
   * Endpoint for creating a new application request.
   * This endpoint expects a POST request containing the details of the app request in the body.
   * It uses the `createNewAppRequestController` to handle the logic for creating a new app request in the system.
   *
   * The request body is validated against the `appRequestValidationBodySchema` using the `validateRequest` middleware.
   * This ensures that the incoming request meets the required structure and data types before it is processed by the controller.
   * If the validation fails, the middleware will prevent the controller from being invoked and will return a validation error response to the client.
   *
   * Access to this endpoint is restricted to users with 'USER' authority level, allowing any authenticated user to submit a new app request.
   * This maintains system integrity by ensuring only valid and authenticated requests are processed.
   */
  {
    name: "create new app request",
    method: "post",
    path: "/create-new-app-request",
    controller: createNewAppRequestController,
    middleware: [validateRequest(appRequestValidationBodySchema, "body")],
    authority: "USER",
  },

  /**
   * Endpoint for retrieving all request records.
   * This endpoint expects a GET request and does not require any request body or parameters.
   * It uses the `getAllRequestsController` to fetch and return all request records stored in the system.
   *
   * No middleware is applied to this endpoint, ensuring direct access to the controller logic.
   * Requires ADMIN authority level to access, ensuring that only users with administrative privileges can retrieve all request records.
   */
  {
    name: "get all requests",
    method: "get",
    path: "/get-all-requests",
    controller: getAllRequestsController,
    middleware: [],
    authority: "ADMIN",
  },

  /**
   * Endpoint for retrieving a request by its ID.
   * This endpoint expects a GET request with the `id` parameter in the URL to specify the ID of the request to retrieve.
   * It uses the `getRequestByIdController` to handle the logic for fetching the request record based on the provided ID.
   * The ID parameter is used to query the database for the specific request record.
   * If the record is found, it is returned in the response with a 200 status code.
   * If the record is not found or an error occurs during the fetch operation, a 500 status code is returned.
   * Requires ADMIN authority level to access, ensuring that only users with administrative privileges can retrieve request records by ID.
   */
  {
    name: "get request by id ",
    method: "get",
    path: "/get-request-by-id/:id",
    controller: getRequestByIdController,
    middleware: [],
    authority: "ADMIN",
  },

  /**
   * Endpoint for updating the status of a request by its ID.
   * This endpoint expects a PUT request with the `requestId` and `status` parameters in the request body.
   * It uses the `updateRequestStatusByIdController` to handle the logic for updating the status of the request.
   * The request ID and the new status are provided in the request body to identify the request and set the new status.
   * Access to this endpoint is restricted to users with 'ADMIN' authority level, ensuring that only administrators can update request statuses.
   */
  {
    name: "update request status ",
    method: "put",
    path: "/update-request-status",
    controller: updateRequestStatusByIdController,
    middleware: [],
    authority: "ADMIN",
  },

  /**
   * Endpoint for deleting a request by its ID.
   * This endpoint expects a DELETE request with the `id` parameter in the URL to specify the ID of the request to delete.
   * It uses the `deleteRequestByIdController` to handle the logic for deleting the request record based on the provided ID.
   * The ID parameter is used to identify the request record to be deleted from the system.
   * If the record is successfully deleted, a 200 status code is returned.
   * If the record is not found or an error occurs during the delete operation, a 500 status code is returned.
   * Requires ADMIN authority level to access, ensuring that only users with administrative privileges can delete request records by ID.
   */
  {
    name: "delete request",
    method: "delete",
    path: "/delete-request/:id",
    controller: deleteRequestByIdController,
    middleware: [],
    authority: "ADMIN",
  },
];
