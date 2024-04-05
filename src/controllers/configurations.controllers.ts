import { RequestHandler } from "express";
import { configurationsService } from "../services/db.services/configurations.db.services";
/**
 * Controller for fetching all server configuration settings.
 *
 * This controller handles an HTTP GET request to retrieve all configuration settings stored within the system.
 * It calls the `getAllConfigurations` method from the `configurationsService`, which is responsible for accessing
 * the data store containing the configurations and returning them.
 *
 * Upon successfully fetching the configurations, the controller sends a response with a 200 status code, along
 * with a JSON object containing a success message and the configurations data.
 *
 * In case of an error during the fetch operation, such as a failure to access the data store or an internal
 * server error, the function logs the error to the console for debugging and returns a response with a 500 status
 * code and an error message indicating an internal server error.
 *
 * @param {Request} req - The Express request object. This function does not use any request parameters.
 * @param {Response} res - The Express response object used to send back the configurations data or an error message.
 * @returns {Promise<void>} A promise that resolves when the response is sent. The function either sends a JSON object
 *                          containing the configurations data or an error message.
 */
export const getAllConfigurations: RequestHandler = async (req, res) => {
  try {
    const configurations = await configurationsService.getAllConfigurations();

    res.status(200).json({
      message: "Server configurations retrieved successfully",
      data: configurations,
    });
  } catch (error) {
    console.error("Error retrieving server configurations:", error);

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
