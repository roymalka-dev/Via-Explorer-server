import { Request, Response } from "express";
import { requestsService } from "../services/db.services/requests.services";
import { userService } from "../services/db.services/users.db.services";

export const requestsControllers = {
  /**
   * Controller for generating a presigned URL for AWS S3 uploads.
   *
   * This controller processes POST requests containing the `bucketName`, `fileName`, and `fileType` within the request body.
   * It validates these fields against the `getS3PresignedUrlValidationBodySchema`. If any required field is missing,
   * it responds with a 400 status code and an error message.
   *
   * Upon successful validation, it calls the `getS3PresignedUrl` service function with the provided parameters to generate
   * a presigned URL for uploading a file to S3, the URL where the file will be accessible after upload, and a hashed version
   * of the file name for storage.
   *
   * The function responds with a 200 status code and a JSON object containing the `presignedUrl`, `fileUrl`, and `hashedFileName`.
   * In case of an internal server error during the presigned URL generation process, it responds with a 500 status code and an error message.
   *
   * @param {Request} req - The Express request object, expected to contain `bucketName`, `fileName`, and `fileType` in the body.
   * @param {Response} res - The Express response object used to send back the presigned URL and related information or an error message.
   * @returns {Promise<void>} A promise that resolves to void. The actual response is handled via the `res` parameter.
   */
  getS3PresignedUrlController: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { bucketName, fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      res
        .status(400)
        .json({ message: "Missing fileName or fileType in the request body." });
      return;
    }

    try {
      const { presignedUrl, fileUrl, hashedFileName } =
        await requestsService.getS3PresignedUrl(bucketName, fileName, fileType);

      res.status(200).json({ data: { presignedUrl, fileUrl, hashedFileName } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Controller for removing an object from an AWS S3 bucket.
   *
   * This controller extracts the `bucketName` and `fileName` from the URL parameters of the DELETE request.
   * It then calls the `removeS3Object` service function with these parameters to delete the specified object from the S3 bucket.
   *
   * If the `fileName` parameter is missing, the controller responds with a 400 status code and an error message.
   * On successful deletion, it responds with a 200 status code and a confirmation message.
   * In case of an internal server error during the deletion process, it responds with a 500 status code and an error message.
   *
   * @param {Request} req - The Express request object, expected to contain `bucketName` and `fileName` in the URL parameters.
   * @param {Response} res - The Express response object used to send back a confirmation message or an error message.
   */
  removeS3ObjectController: async (req: Request, res: Response) => {
    const { bucketName, fileName } = req.params;

    if (!fileName) {
      res
        .status(400)
        .json({ message: "Missing fileName in the request body." });
      return;
    }

    try {
      await requestsService.removeS3Object(bucketName, fileName);
      res.status(200).json({ message: "File removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Controller for handling the creation of new app requests.
   *
   * This controller processes the incoming POST request to create a new app request based on the provided details in the request body.
   * The `request` field within the body is expected to contain the new app request's details. If this field is missing,
   * the controller responds with a 400 status code and an error message indicating the omission.
   *
   * On successful creation of the app request, the function associates the newly created request with the performing user,
   * identified through the session, and responds with a 200 status code along with a message confirming the successful creation.
   *
   * If any errors occur during the process of creating the app request or associating it with the user, the function responds
   * with a 500 status code, indicating an internal server error, along with an error message.
   *
   * @param {Request} req - The Express request object, expected to contain the new app request details within the `request` field of the body.
   * @param {Response} res - The Express response object used to send back a confirmation message or an error message.
   * @returns {Promise<void>} - A promise that resolves when the response is sent.
   */
  createNewAppRequestController: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const request = req.body;
    const performingUser = req.session.user;

    if (!request) {
      res.status(400).json({ message: "Missing request in the request body." });
      return;
    }

    try {
      const reqId = await requestsService.createNewAppRequest(
        request,
        performingUser
      );
      await userService.addRequestToUser(performingUser, reqId);

      res.status(200).json({
        message: `Request ${reqId} created successfully`,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Controller for fetching all request records from the system.
   *
   * This controller handles an HTTP GET request to retrieve all request records. It calls the `getAllRequests`
   * service function, which queries the database for all request records. The resulting list of requests is then
   * returned in the response with a 200 status code.
   *
   * In case of a successful fetch, the function responds with a 200 status code and a JSON object containing
   * an array of request records under the 'data' key.
   * If an error occurs during the fetch operation, a 500 status code is returned with an "Internal server error" message.
   *
   * @param {Request} req - The Express request object. This endpoint does not use any request parameters.
   * @param {Response} res - The Express response object used to send back the list of request records or an error message.
   */
  getAllRequestsController: async (req: Request, res: Response) => {
    try {
      const requests = await requestsService.getAllRequests();
      res.status(200).json({ data: requests });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Controller for fetching a single request record by its ID from the system.
   *
   * This controller handles an HTTP GET request to retrieve a specific request record by its ID. It extracts
   * the 'reqtId' parameter from the request's parameters and calls the `getRequestsByIds` service function,
   * passing an array containing the requested ID. This service function then queries the database for the request
   * record with the matching ID. If found, the request record is returned in the response with a 200 status code.
   *
   * In case of a successful fetch, the function responds with a 200 status code and a JSON object containing
   * the request record under the 'data' key. If the request record cannot be found, or if an error occurs during
   * the fetch operation, a 500 status code is returned with an "Internal server error" message.
   *
   * @param {Request} req - The Express request object, expected to contain the 'reqtId' parameter in its path.
   * @param {Response} res - The Express response object used to send back the fetched request record or an error message.
   */
  getRequestByIdController: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const request = await requestsService.getRequestsByIds([id]);

      if (request.length === 0) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.status(200).json({ data: request[0] });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Updates the status of a request by its ID.
   *
   * @module updateRequestStatusByIdController
   * @function
   * @param {Request} req - The express request object, which includes:
   *   - requestId (string): The ID of the request to be updated.
   *   - status (string): The new status to set for the request.
   * @param {Response} res - The express response object used to send back a response.
   *
   * @description
   * This controller handles a PUT request to update the status of a request based on its unique ID.
   * The requestId and the new status are expected to be provided in the request body.
   * It leverages the `requestsService.updateRequestStatus` function to perform the update operation.
   *
   * On success, it sends a JSON response with a 200 status code and the updated request data.
   * On failure, due to any internal errors, it sends a 500 status code with an error message.
   *
   * @example
   * PUT /api/requests/update-status
   * Request body:
   * {
   *   "requestId": "12345",
   *   "status": "completed"
   * }
   * Successful response:
   * {
   *   "data": {
   *     "requestId": "12345",
   *     "status": "completed"
   *   }
   * }
   * Error response:
   * {
   *   "message": "Internal server error"
   * }
   *
   * @returns {void}
   */
  updateRequestStatusByIdController: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { requestId, status } = req.body;

    try {
      const updatedRequest = await requestsService.updateRequestStatus(
        requestId,
        status
      );
      res.status(200).json({ data: updatedRequest });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Controller for deleting a request by its ID from the database.
   * This endpoint handles DELETE requests to remove a specific request
   * based on the provided ID. It leverages the `requestsService.deleteRequestById`
   * to perform the deletion operation.
   *
   * @module RequestControllers
   * @function deleteRequestByIdController
   * @param {Request} req - The Express request object, which contains:
   *  - params: An object with the request parameters where `id` is the ID of the request to be deleted.
   * @param {Response} res - The Express response object used to send back the HTTP response.
   * @returns {void} This function does not return anything. It sends a JSON response with either a success or error message.
   *
   * @example
   * DELETE /api/requests/{id}
   * Response:
   *  Success: 200 OK { message: "Request deleted successfully" }
   *  Error: 500 Internal Server Error { message: "Internal server error" }
   *
   * @description
   * This controller validates that an ID is provided and then attempts to delete the corresponding
   * request from the database. If the deletion is successful, it responds with a 200 status code and a success message.
   * If the deletion fails, it catches any thrown errors, logs them, and responds with a 500 status code and an error message.
   */
  deleteRequestByIdController: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;

    try {
      await requestsService.deleteRequestById(id);
      res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
