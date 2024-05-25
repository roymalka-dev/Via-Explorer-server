import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../db/db";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { AnnouncementType } from "types/site.types";

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
  createAnnouncement: async (announcement: AnnouncementType) => {
    const key = marshall({ key: "announcements" });

    try {
      const currentData = await dynamoDB.send(
        new GetItemCommand({
          TableName: tableName,
          Key: key,
          ProjectionExpression: "data",
        })
      );

      let announcements = [];
      if (currentData.Item) {
        announcements = unmarshall(currentData.Item).data.L;
      }

      const newAnnouncement = {
        M: {
          date: { N: announcement.date.toString() },
          message: { S: announcement.message },
          title: { S: announcement.title },
        },
      };

      announcements.push(newAnnouncement);

      await dynamoDB.send(
        new UpdateItemCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: "SET data.L = :newData",
          ExpressionAttributeValues: {
            ":newData": { L: announcements },
          },
        })
      );
    } catch (error) {
      throw error;
    }
  },
};
