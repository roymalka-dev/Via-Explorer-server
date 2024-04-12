import {
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../db/db";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { getConfigValue } from "../../utils/configurations.utils";
import { requestsService } from "./requests.services";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TableName = "users";

export const userService = {
  /**
   * Retrieves user details from the database based on the provided email.
   *
   * This function fetches user details from the database using the user's email as the primary key.
   * It constructs a GetItemCommand to retrieve the user item from the DynamoDB table specified by 'TableName'.
   *
   * The function accepts an email string as input and constructs the key parameter using DynamoDB Marshall to
   * simplify key construction and avoid errors related to DynamoDB's strict key formatting requirements.
   *
   * Upon successfully retrieving the user item from the database, the function checks if the item exists.
   * If found, it unmarshalls the item using DynamoDB Marshall to convert it to a plain JavaScript object before returning.
   *
   * If no item is found for the provided email, the function returns null.
   *
   * @param {string} email The email of the user to retrieve.
   * @returns {Promise<Object|null>} A promise that resolves to the user details as a plain JavaScript object,
   *                                 or null if no user is found for the provided email.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async getUserByEmail(email: string) {
    const { Item } = await dynamoDB.send(
      new GetItemCommand({
        TableName,
        Key: marshall({ email }), // Use marshall to simplify key construction
      })
    );

    if (!Item) return null;

    return unmarshall(Item);
  },

  /**
   * Adds a new user to the database.
   *
   * This function inserts a new user into the database with the provided user details.
   * It constructs a PutItemCommand to add the user item to the DynamoDB table specified by 'TableName'.
   *
   * The function accepts an object containing user details as input, including the user's email, authorization level,
   * and optional arrays of favorites and requests.
   *
   * If the provided user details do not include favorites or requests arrays, empty arrays are assigned to them
   * to prevent null or undefined values during marshalling.
   *
   * The function marshals the user details object to ensure proper formatting for DynamoDB and sends a PutItemCommand
   * with the marshalled item to the database.
   *
   * @param {Object} userDetails An object containing user details, including email, authorization level,
   *                             and optional arrays of favorites and requests.
   * @param {string} userDetails.email The email address of the user being added.
   * @param {string} userDetails.authorization The authorization level of the user being added.
   * @param {string[]} [userDetails.favorites] An optional array of favorite items for the user.
   * @param {string[]} [userDetails.requests] An optional array of request IDs associated with the user.
   * @returns {Promise<void>} A promise that resolves when the user is successfully added to the database.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async addUser(userDetails: {
    email: string;
    authorization: string;
    favorites?: string[];
    requests?: string[];
  }) {
    const item = marshall({
      ...userDetails,
      favorites: userDetails.favorites || [],
      requests: userDetails.requests || [],
    });

    await dynamoDB.send(
      new PutItemCommand({
        TableName,
        Item: item,
      })
    );
  },
  /**
   * Retrieves all users from the database.
   *
   * This function performs a scan operation on the DynamoDB table specified by 'TableName' to fetch all user items.
   * It constructs a ScanCommand to scan the entire table and retrieve all user items.
   *
   * The function then processes the response from DynamoDB, unmarshalling each item to convert it to a JavaScript object.
   *
   * If the scan operation returns no items, an empty array is returned.
   *
   * @returns {Promise<Object[]>} A promise that resolves with an array of user objects containing details of all users in the database.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async getAllUsers() {
    try {
      const { Items } = await dynamoDB.send(
        new ScanCommand({
          TableName,
        })
      );

      if (Items) {
        return Items.map((item) => unmarshall(item));
      }

      return [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves details of a user based on the provided email address.
   *
   * This function queries the database to fetch the user with the specified email address.
   * It first calls the 'getUserByEmail' function from the 'userService' to retrieve the user item from the database.
   * If no user is found for the provided email address, the function returns null.
   *
   * If a user is found, the function unmarshalls the retrieved user item to convert it to a JavaScript object.
   *
   * @param {string} email The email address of the user to retrieve details for.
   * @returns {Promise<Object|null>} A promise that resolves with the user object containing details of the user with the specified email address, or null if no user is found.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async getUserDetails(email: string) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return null;
    }

    return user;
  },

  /**
   * Updates the role of a specific user in the DynamoDB table.
   *
   * This function modifies the 'authorization' attribute of a user record identified by email. It sets the authorization level
   * to the new role provided in the function arguments. The function constructs and sends an UpdateCommand to DynamoDB and
   * returns the response from the database.
   *
   * @param {string} email - The email of the user whose role is to be updated.
   * @param {any} role - The new role to be assigned to the user.
   * @returns {Promise<object>} - The result object from DynamoDB if the update is successful.
   * @throws {Error} - Throws an error if the update operation fails.
   */

  async updateUser(email: string, role: any) {
    const params = {
      TableName,
      Key: { email },
      UpdateExpression: "SET #auth = :authValue",
      ExpressionAttributeNames: {
        "#auth": "authorization",
      },
      ExpressionAttributeValues: {
        ":authValue": role,
      },
    };

    try {
      const command = new UpdateCommand(params);
      const result = await dynamoDB.send(command);
      return result;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  /**
   * Retrieves the list of favorites for a user based on the provided email address.
   *
   * This function queries the database to fetch the favorites of the user with the specified email address.
   * It first calls the 'getUserByEmail' function from the 'userService' to retrieve the user item from the database.
   * If no user is found for the provided email address, the function logs an error and returns an empty array.
   *
   * If a user is found, the function unmarshalls the retrieved user item to convert it to a JavaScript object.
   * It then checks if the user object contains the 'favorites' property and if it's structured as expected.
   * If the 'favorites' property is missing or not in the expected structure, the function logs an error and returns an empty array.
   *
   * If the 'favorites' property is correctly structured, the function extracts the favorites from the user object, filters out any empty values, and returns them.
   *
   * @param {string} email The email address of the user to retrieve favorites for.
   * @returns {Promise<string[]>} A promise that resolves with an array containing the user's favorites, or an empty array if no favorites are found or there's an error.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async getUserFavorites(email: string): Promise<string[]> {
    try {
      const user = await userService.getUserByEmail(email);

      if (!user) {
        console.error("User not found.");
        return [];
      }

      if (!user.favorites || !user.favorites) {
        return [];
      }

      const favorites = user.favorites
        .map((favorite: any) => favorite)
        .filter(Boolean);

      if (!favorites.length) {
        return [];
      }

      return favorites;
    } catch (error) {
      throw new Error("An error occurred while fetching user favorites.");
    }
  },

  /**
   * Toggles a favorite item for a user based on the provided email address and favorite item.
   *
   * This function first retrieves the current list of favorites for the user using the 'getUserFavorites' function.
   * It then checks if the provided favorite item already exists in the user's favorites.
   * If the item exists, it prepares to remove it from the favorites list. If not, it prepares to add it.
   *
   * After determining the update expression and expression attribute values based on the toggle action,
   * the function constructs the update parameters and sends an update command to the database to modify the user's favorites.
   *
   * @param {string} email The email address of the user to toggle the favorite for.
   * @param {string} favoriteItem The ID of the favorite item to toggle.
   * @returns {Promise<void>} A promise that resolves once the toggle operation is completed successfully.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async toggleUserFavorite(email: string, favoriteItem: string): Promise<void> {
    try {
      const currentFavorites = await this.getUserFavorites(email);

      let updateExpression;
      let expressionAttributeValues;

      if (currentFavorites.includes(favoriteItem)) {
        // If the item exists, prepare to remove it
        const newFavorites = currentFavorites.filter(
          (item: any) => item !== favoriteItem
        );
        updateExpression = "SET favorites = :fav";
        expressionAttributeValues = {
          ":fav": { L: newFavorites.map((item: any) => ({ S: item })) },
        };
      } else {
        // If the item doesn't exist, prepare to add it
        const newFavorites = [...currentFavorites, favoriteItem];
        updateExpression = "SET favorites = :fav";
        expressionAttributeValues = {
          ":fav": { L: newFavorites.map((item) => ({ S: item })) },
        };
      }

      const updateParams = {
        TableName: "users",
        Key: { email: { S: email } },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      };

      const updateCommand = new UpdateItemCommand(updateParams);
      await dynamoDB.send(updateCommand);
    } catch (error) {
      throw new Error("An error occurred while toggling user favorite.");
    }
  },

  /**
   * Retrieves the recently viewed items for a user based on the provided email address.
   *
   * This function fetches the user's data from the database using the provided email address.
   * It extracts the 'recentlyViewed' attribute from the user's data.
   * If the attribute exists and contains a list of recently viewed items, it returns that list.
   * If the attribute doesn't exist or is empty, it returns an empty array.
   *
   * @param {string} email The email address of the user to retrieve recently viewed items for.
   * @returns {Promise<string[]>} A promise that resolves with an array of recently viewed item IDs.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async getRecentlyViewed(email: string) {
    const params = {
      TableName: "users",
      Key: { email: { S: email } },
      ProjectionExpression: "recentlyViewed",
    };

    const command = new GetItemCommand(params);
    const response = await dynamoDB.send(command);
    return response.Item?.recentlyViewed?.SS || [];
  },

  /**
   * Updates the queue of recently viewed items for a user based on the provided email address and app ID.
   *
   * This function retrieves the user's current queue of recently viewed items from the database using the provided email address.
   * It maintains the order of the items viewed by adding the provided app ID to the end of the queue. If the app ID already exists in the queue, it is removed before being re-added to ensure it reflects the most recent view. The function ensures the queue does not exceed a predefined maximum size by removing the oldest viewed items first.
   * The updated queue is then stored back in the database for the user.
   *
   * @param {string} email The email address of the user to update the queue of recently viewed items for.
   * @param {string} appId The ID of the app to add to the queue of recently viewed items.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async updateUserRecentlyViewed(email: string, appId: string) {
    const NUMBER_OF_USER_RECENTLY_VIEWED_APPS = Number(
      getConfigValue("NUMBER_OF_USER_RECENTLY_VIEWED_APPS", 10)
    );

    try {
      const getParams = {
        TableName: "users",
        Key: { email: { S: email } },
        ProjectionExpression: "recentlyViewed",
      };
      const getCommand = new GetItemCommand(getParams);
      const getResponse = await dynamoDB.send(getCommand);
      let currentList = getResponse.Item?.recentlyViewed?.SS || [];

      currentList = currentList.filter((app) => app !== appId);

      currentList.push(appId);

      while (currentList.length > NUMBER_OF_USER_RECENTLY_VIEWED_APPS) {
        currentList.shift();
      }

      const updateParams = {
        TableName: "users",
        Key: { email: { S: email } },
        UpdateExpression: "SET recentlyViewed = :rv",
        ExpressionAttributeValues: {
          ":rv": { SS: currentList },
        },
      };
      const updateCommand = new UpdateItemCommand(updateParams);
      await dynamoDB.send(updateCommand);
    } catch (error) {
      throw new Error("An error occurred while updating user recently viewed.");
    }
  },

  /**
   * Adds a request ID to the list of requests associated with a user, based on the provided email address.
   *
   * This function updates the user's record in the database by adding the provided request ID to the list of requests associated with the user.
   *
   * @param {string} email The email address of the user to add the request to.
   * @param {string} requestId The ID of the request to add to the user's list of requests.
   * @returns {Promise<any>} A promise that resolves when the request has been successfully added to the user's list of requests in the database.
   * @throws {Error} Throws an error if there's an issue during the database operation, such as connectivity problems or permission errors.
   */
  async addRequestToUser(email: string, requestId: string) {
    const params = {
      TableName: TableName,
      Key: { email: { S: email } },
      UpdateExpression: "ADD requests :req",
      ExpressionAttributeValues: {
        ":req": { SS: [requestId] },
      },
    };

    try {
      const command = new UpdateItemCommand(params);
      return dynamoDB.send(command);
    } catch (error) {
      throw new Error("An error occurred while adding request to user.");
    }
  },

  /**
   * Retrieves the list of requests associated with a user, based on the provided email address.
   *
   * This function retrieves the list of request IDs associated with the user identified by the provided email address.
   * It then fetches the details of these requests using the `getRequestsByIds` function and returns them as an array.
   *
   * @param {string} email The email address of the user whose requests are to be retrieved.
   * @returns {Promise<any[]>} A promise that resolves with an array containing the details of the requests associated with the user.
   * If the user has no requests or if the user does not exist, an empty array is returned.
   * @throws {Error} Throws an error if there's an issue during the retrieval process, such as connectivity problems or permission errors.
   */
  async getUserRequests(email: string) {
    try {
      const user = await userService.getUserByEmail(email);

      if (!user || !user.requests) {
        return [];
      }

      const requestIds = [...user.requests];

      if (!Array.isArray(requestIds) || requestIds.length === 0) {
        return [];
      }

      const requests = await requestsService.getRequestsByIds(requestIds);
      return requests;
    } catch (error) {
      throw error;
    }
  },
};
