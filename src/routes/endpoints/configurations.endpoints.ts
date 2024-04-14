import {
  editConfigurationValueController,
  getAllConfigurations,
} from "../../controllers/configurations.controllers";
import { EndpointType } from "../../types/routes.types";
/**
 * Endpoints related to configuration settings within the application.
 *
 * @type {EndpointType[]} configurationsEndpoints
 */
export const configurationsEndpoints: EndpointType[] = [
  /**
   * Endpoint for retrieving all configuration settings.
   * This endpoint expects a GET request and does not require any request body.
   * It uses the `getAllConfigurations` controller to handle the request logic, fetching all configuration settings from the database.
   * There is no middleware applied to this endpoint, ensuring direct access to the controller logic.
   * Requires ADMIN authority level to access, ensuring that only users with administrative privileges can retrieve configuration settings.
   */
  {
    name: "get all configurations",
    method: "get",
    path: "/get-all-configurations",
    controller: getAllConfigurations,
    middleware: [],
    authority: "ADMIN",
  },

  /**
   * Endpoint for editing a configuration value.
   * This endpoint expects a PUT request with a JSON body containing the key and value of the configuration to update.
   * It uses the `editConfigurationValueController` controller to handle the request logic, updating the specified configuration value in the database.
   * There is no middleware applied to this endpoint, ensuring direct access to the controller logic.
   * Requires ADMIN authority level to access, ensuring that only users with administrative privileges can update configuration settings.
   */
  {
    name: "edit configuration value",
    method: "put",
    path: "/edit-configuration",
    controller: editConfigurationValueController,
    middleware: [],
    authority: "ADMIN",
  },
];
