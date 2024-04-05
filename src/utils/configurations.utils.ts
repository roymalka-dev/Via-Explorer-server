import { configurationsService } from "../services/db.services/configurations.db.services";
import { ConfigurationItem } from "../types/configurations.types";

/**
 * Retrieves the value of a configuration item based on the provided key.
 *
 * This function searches for a configuration item with the specified key in the global configurations array.
 * If found, it returns the value of that configuration item. If not found, it returns the provided default value.
 *
 * @param {string} key The key of the configuration item to retrieve.
 * @param {number | string} defaultValue The default value to return if the configuration item is not found.
 * @returns {number | string} The value of the configuration item if found, or the default value otherwise.
 */
export const getConfigValue = (
  key: string,
  defaultValue: number | string
): number | string => {
  const configItem = (global as any).configurations?.find(
    (config: ConfigurationItem) => config.name === key
  );
  return configItem ? configItem.value : defaultValue;
};

/**
 * Fetches all server configurations and sets them in the global configurations variable.
 *
 * This function retrieves all server configurations using the `getAllConfigurations` function from the configurations service.
 * It then sets the retrieved configurations in the global configurations variable to make them accessible throughout the application.
 *
 * If there's an error during the process of fetching or setting the configurations, an error message is logged to the console.
 *
 * @throws {Error} Throws an error if there's an issue during the process of fetching or setting the configurations.
 */
export const setConfigurations = async () => {
  try {
    const configurations = await configurationsService.getAllConfigurations();

    (global as any).configurations = configurations;
  } catch (error) {
    console.error("Failed to set server configurations:", error);
  }
};
