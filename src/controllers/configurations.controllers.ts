import logger from "../logger/logger";
import { configurationsService } from "../services/db.services/configurations.db.services";
import { Request, Response } from "express";

export const configurationControllers = {
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
  getAllConfigurations: async (req: Request, res: Response): Promise<void> => {
    try {
      const configurations = await configurationsService.getAllConfigurations();

      res.status(200).json({
        message: "Server configurations retrieved successfully",
        data: configurations,
      });
    } catch (error) {
      logger.error("Error getting all configurations", {
        tag: "error",
        location: "configurations.controllers.ts",
        error: (error as Error).message,
      });

      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  /**
   * Updates a specific configuration value based on a provided key.
   *
   * This controller handles an HTTP PUT request. It expects the request body to contain a key-value pair
   * representing the configuration setting to be updated. It utilizes the `editConfigurationValue` method
   * from the `configurationsService` to update the configuration value in the data store.
   *
   * @param {Request} req - The Express request object, containing the 'key' and 'value' to be updated in the body.
   * @param {Response} res - The Express response object used to send back a success or error message.
   * @returns {Promise<void>} A promise that resolves when the response is sent. The response includes a success
   *                          message if the update was successful, or an error message if the configuration key
   *                          was not found or if there was an internal server error.
   */

  editConfigurationValueController: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { key, value } = req.body;

    try {
      const success = await configurationsService.editConfigurationValue(
        key,
        value
      );

      if (success) {
        res.status(200).json({
          message: "Configuration value updated successfully",
        });
      } else {
        res.status(404).json({
          message: "Configuration key not found",
        });
      }
    } catch (error) {
      logger.error("Error editing configuration", {
        tag: "error",
        location: "configurations.controllers.ts",
        error: (error as Error).message,
      });
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
};
