import { ConfigurationItem } from "types/configurations.types";
import { dynamoDB } from "../../db/db";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

const tableName = "configurations";

export const configurationsService = {
  /**
   * Retrieves all server configurations from the DynamoDB table.
   *
   * This function scans the DynamoDB table specified by the tableName variable
   * and returns an array of ConfigurationItem objects, each representing a server
   * configuration stored in the table. It uses the AWS SDK for JavaScript v3.
   *
   * @returns A Promise that resolves to an array of ConfigurationItem objects,
   *          each containing the name, location, and value of a server configuration.
   */
  getAllConfigurations: async (): Promise<ConfigurationItem[]> => {
    const params = {
      TableName: tableName,
    };

    try {
      const data = await dynamoDB.send(new ScanCommand(params));

      // Manually convert DynamoDB items to ConfigurationItem objects
      const configurations = data.Items?.map((item) => {
        return {
          name: item.name?.S || "",
          location: item.location?.S || "",
          type: item.type?.S || "",
          value: item.value?.N ? Number(item.value.N) : item.value?.S || "",
        };
      }) as ConfigurationItem[];

      return configurations;
    } catch (error) {
      console.error("Error retrieving server configurations:", error);
      throw error;
    }
  },
};
