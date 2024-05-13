import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../db/db";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const tableName = "site";

export const siteServices = {
  getAnnouncements: async () => {
    const params = {
      TableName: tableName,
      Key: {
        key: { S: "announcements" },
      },
    };

    try {
      const response = await dynamoDB.send(new GetItemCommand(params));
      return response.Item ? unmarshall(response.Item) : {};
    } catch (error) {
      throw error;
    }
  },
};
