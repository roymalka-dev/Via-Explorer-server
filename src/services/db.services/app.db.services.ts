import { GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../db/db";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { AppType } from "../../types/app.types";
import {
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import axios from "axios";

const tableName = "apps";

export const appService = {
  /**
   * Retrieves an application by its ID from the DynamoDB table.
   *
   * This function accepts an application ID as a parameter and constructs a query to fetch the corresponding
   * app record from a DynamoDB table. If an app with the specified ID is found, it unmarshalls the DynamoDB item
   * into a more readable format and returns it as an `AppType` object. If no app is found, the function returns null.
   *
   * The function is asynchronous and returns a promise that resolves to either an `AppType` object or null.
   * In the case of a DynamoDB error, the error is logged to the console and then rethrown to be handled by the caller.
   *
   * @param {string} id - The unique identifier of the application to be retrieved.
   * @returns {Promise<AppType | null>} A promise that resolves to the app corresponding to the provided ID,
   *                                    or null if no such app is found.
   * @throws {Error} Throws an error if there's an issue retrieving the app from DynamoDB.
   */
  getAppById: async (id: string): Promise<AppType | null> => {
    const params = {
      TableName: tableName,
      Key: {
        id: { S: id },
      },
    };

    try {
      const { Item } = await dynamoDB.send(new GetItemCommand(params));
      return Item ? (unmarshall(Item) as AppType) : null;
    } catch (error) {
      console.error(`Error retrieving app with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetches all applications from the DynamoDB table.
   *
   * This function constructs a query to scan the entire DynamoDB table specified by `tableName`.
   * It retrieves all records and converts them from the DynamoDB item format to a more readable format
   * using the `unmarshall` function. The function returns an array of `AppType` objects representing all
   * applications stored in the table. If no items are found, an empty array is returned.
   *
   * The function is asynchronous and returns a promise that resolves to an array of `AppType` objects.
   * In case of a DynamoDB error during the scan operation, the error is logged to the console and then rethrown
   * to be handled by the caller.
   *
   * @returns {Promise<AppType[]>} A promise that resolves to an array of all app objects stored in the DynamoDB table.
   * @throws {Error} Throws an error if there's an issue scanning the DynamoDB table for apps.
   */
  getAllApps: async (): Promise<AppType[]> => {
    const params = {
      TableName: tableName,
    };

    try {
      const { Items } = await dynamoDB.send(new ScanCommand(params));
      return Items ? Items.map((item) => unmarshall(item) as AppType) : [];
    } catch (error) {
      console.error("Error retrieving all apps:", error);
      throw error;
    }
  },

  /**
   * Retrieves a list of applications based on the provided array of IDs.
   * It makes asynchronous calls to `appService.getAppById` for each ID,
   * filters out any null results to ensure all returned items are valid applications,
   * and handles errors that may occur during the process.
   *
   * @param {string[]} ids - An array of application IDs to retrieve.
   * @returns {Promise<AppType[]>} A promise that resolves to an array of `AppType` objects representing the applications. If an error occurs, the promise will be rejected.
   *
   * @example
   * // Assuming 'appService.getAppsByIds' is called within an async function
   * try {
   *   const apps = await appService.getAppsByIds(['1', '2', '3']);
   *   console.log(apps);
   * } catch (error) {
   *   console.error('Failed to retrieve apps:', error);
   * }
   */
  getAppsByIds: async (ids: string[]): Promise<AppType[]> => {
    try {
      const strictIds = ids.slice(0, 36); // Limit to 36 IDs to avoid exceeding the batch get limit
      const appsPromises = strictIds.map((id) => appService.getAppById(id));
      const apps = await Promise.all(appsPromises);

      // Filter out any null values and ensure TypeScript knows these are AppType
      return apps.filter((app): app is AppType => app !== null);
    } catch (error) {
      console.error("Error getting apps by IDs:", error);
      throw new Error("Failed to get apps");
    }
  },

  /**
   * Adds a new application to the DynamoDB table.
   *
   * This function accepts an `AppType` object containing the application data to be added. It constructs
   * a DynamoDB PutCommand with the provided application data as the item to be inserted into the table
   * specified by `tableName`. If the operation is successful, the function returns `true` to indicate
   * the successful addition of the new app.
   *
   * The function is asynchronous and returns a promise that resolves to a boolean value indicating
   * the success of the operation. In case of an error during the DynamoDB put operation, the error is logged
   * to the console and then rethrown to be handled by the caller.
   *
   * @param {AppType} appData - An object containing the application data to be added to the DynamoDB table.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the app is successfully added to the table.
   * @throws {Error} Throws an error if there's an issue adding the app to the DynamoDB table.
   */
  addNewApp: async (appData: AppType): Promise<boolean> => {
    const params = {
      TableName: tableName,
      Item: appData,
    };

    try {
      await dynamoDB.send(new PutCommand(params));
      return true;
    } catch (error) {
      console.error("Error adding new app:", error);
      throw error;
    }
  },
  /**
   * Searches for an application in either the Apple App Store or Google Play Store by app name.
   *
   * This function accepts a store type ('appstore' or 'playstore') and the name of the application to be searched.
   * It constructs the appropriate API request based on the store type:
   * - For the App Store, it sends an HTTP GET request to the iTunes search API.
   * - For the Play Store, it uses the `google-play-scraper` library to search for the app.
   *
   * If an app is found, the function returns the first result's details from the respective store's search results.
   * If no app is found or in case of an error, `null` is returned.
   *
   * The function is asynchronous and returns a promise that resolves to the app details object if an app is found,
   * or `null` otherwise.
   *
   * @param {"appstore" | "playstore"} store - The store to search in. Can be 'appstore' for the Apple App Store or 'playstore' for Google Play Store.
   * @param {string} appName - The name of the application to search for in the specified store.
   * @returns {Promise<any>} A promise that resolves to an object containing app details if found, or `null` if no app is found or in case of an error.
   * @throws {Error} The function logs an error to the console but returns `null` instead of throwing to avoid breaking execution flow.
   */
  searchAppInStore: async (
    store: "appstore" | "playstore",
    appName: string
  ): Promise<any> => {
    try {
      const encodedAppName = encodeURIComponent(appName);

      if (store === "appstore") {
        const url = `https://itunes.apple.com/search?term=${encodedAppName}&entity=software`;
        const response = await axios.get(url);
        const app = response.data.results[0];
        return app;
      } else if (store === "playstore") {
        const gplay = await import("google-play-scraper").then(
          (module: any) => module.default || module
        );
        const searchResults = await gplay.search({
          term: appName,
          num: 1,
        });

        if (searchResults.length > 0) {
          const appId = searchResults[0].appId;

          const appDetails = await gplay.app({ appId: appId });

          return appDetails;
        }
        return null;
      }
    } catch (error) {
      console.error("Error fetching app data:", error);
      return null;
    }
  },
  /**
   * Searches for applications in the DynamoDB table based on a given query string.
   *
   * This function constructs a DynamoDB scan command with a filter expression to search for applications
   * whose `id` or `name` attributes contain the provided query string. It uses DynamoDB's `ScanCommand` to
   * perform the search and then maps over the resulting items to unmarshall them from the DynamoDB item format
   * to a more readable format.
   *
   * If no matching applications are found, or in case of an error during the search operation, appropriate
   * handling is performed.
   *
   * @param {string} query - The query string used to search for applications by `id` or `name`.
   * @returns {Promise<AppType[]>} A promise that resolves to an array of `AppType` objects representing the
   *                               matching applications. Returns an empty array if no matches are found.
   * @throws {Error} Throws an error if there's an issue performing the search operation in DynamoDB.
   */
  searchAppsInDb: async (query: string): Promise<AppType[]> => {
    const searchParams = {
      TableName: tableName,
      FilterExpression: "contains(#id, :query) OR contains(#queryName, :query)",
      ExpressionAttributeNames: {
        "#id": "id",
        "#queryName": "queryName",
      },
      ExpressionAttributeValues: {
        ":query": { S: query },
      },
    };

    try {
      const { Items } = await dynamoDB.send(new ScanCommand(searchParams));

      if (!Items || Items.length === 0) {
        return []; // Return early if no items found
      }

      const apps = Items.map((item) => unmarshall(item));

      return apps as AppType[];
    } catch (error) {
      console.error("Error searching for app in DB:", error);
      throw error;
    }
  },

  /**
   * Updates multiple applications in the DynamoDB table based on the provided array of application data.
   *
   * This function iterates over an array of application objects, each representing updates to be made to a specific
   * application in the DynamoDB table. It constructs a DynamoDB `UpdateCommand` for each application, specifying
   * the attributes to be updated. The function ensures that the `name` and `id` attributes, which are considered
   * key attributes, are not modified during the update process.
   *
   * The updates are performed asynchronously, and the function waits for all update operations to complete before
   * resolving. If any of the updates fail, the function will throw an error and terminate the update process.
   *
   * @param {AppType[]} apps - An array of `AppType` objects, each containing the `id` of the application to update
   *                           and the attributes to be updated. The `id` attribute is used to identify the record in
   *                           the DynamoDB table, and the other attributes are updated accordingly.
   * @returns {Promise<void>} - A promise that resolves when all updates have been successfully completed. If an error
   *                            occurs during the update process, the promise will reject with an error.
   * @throws {Error} - Throws an error if there's an issue performing the update operations in DynamoDB.
   */

  updateMultipleApps: async (apps: AppType[]): Promise<void> => {
    console.log("Updating multiple apps...");
    const updatePromises = apps.map(async (app) => {
      const { id, ...attributesToUpdate } = app;

      let updateExpression = "SET";
      let expressionAttributeValues: { [key: string]: any } = {}; // This line remains the same
      let expressionAttributeNames: { [key: string]: string } = {}; // Specify the type explicitly

      for (const [key, value] of Object.entries(attributesToUpdate)) {
        if (key !== "name" && key !== "id") {
          // Ensure 'name' and 'id' are not updated
          const placeholder = `:${key}`;
          let expressionKey = key;

          // Check if the attribute is 'region' and use a placeholder if so
          if (key === "region") {
            expressionKey = "#region";
            expressionAttributeNames["#region"] = "region";
          }

          updateExpression += ` ${expressionKey} = ${placeholder},`;
          expressionAttributeValues[placeholder] = value;
        }
      }

      // Remove the last comma from the update expression
      updateExpression = updateExpression.slice(0, -1);

      const params: UpdateCommandInput = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ...(Object.keys(expressionAttributeNames).length > 0 && {
          ExpressionAttributeNames: expressionAttributeNames,
        }),
      };

      // Execute the update command
      return dynamoDB.send(new UpdateCommand(params));
    });

    // Wait for all the updates to complete
    await Promise.all(updatePromises);
  },
};
