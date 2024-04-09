import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { dynamoDB, s3Client } from "../../db/db";
import crypto from "crypto";
import { AppRequestType } from "../../types/request.types";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { BatchGetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const tableName = "requests";

export const requestsService = {
  /**
   * Generates a presigned URL for uploading a file to an S3 bucket, along with the URL where the file will be accessible after the upload.
   *
   * This function takes the name of the S3 bucket, the original file name, and the file type (MIME type) as inputs. It generates a hashed
   * file name to ensure uniqueness and avoid collisions in the S3 bucket. A presigned URL for uploading the file to S3 is then generated using
   * AWS SDK's `getSignedUrl` function, with a specified expiration time.
   *
   * The function returns an object containing the presigned URL for uploading, the URL where the uploaded file will be accessible, and the
   * hashed file name used as the key in the S3 bucket.
   *
   * @param {string} bucketName - The name of the S3 bucket where the file will be uploaded.
   * @param {any} fileName - The original name of the file to be uploaded. The file extension is extracted from this name.
   * @param {any} fileType - The MIME type of the file to be uploaded, used to set the `ContentType` in the S3 bucket.
   * @returns {Promise<{ presignedUrl: string, fileUrl: string, hashedFileName: string }>} A promise that resolves to an object containing the presigned URL for uploading, the URL for accessing the uploaded file, and the hashed file name used as the S3 key.
   * @throws {Error} Throws an error if there's an issue generating the presigned URL or any other part of the process.
   */
  getS3PresignedUrl: async (
    bucketName: string,
    fileName: any,
    fileType: any
  ) => {
    const extension = fileName.split(".").pop();
    const hash = crypto.createHash("sha256");
    hash.update(`${fileName}-${Date.now()}-${Math.random()}`);
    const hashedFileName = `${hash
      .digest("hex")
      .substring(0, 16)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: hashedFileName,
      ContentType: fileType,
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 60, // Time in seconds before the presigned URL expires, e.g., 60 seconds
      });

      // Return both the presigned URL and the URL where the file will be accessible after upload
      const fileUrl = `https://${bucketName}.s3.${
        process.env.AWS_REGION
      }.amazonaws.com/${encodeURIComponent(hashedFileName)}`;

      return { presignedUrl, fileUrl, hashedFileName };
    } catch (error) {
      throw error;
    }
  },
  /**
   * Deletes an object specified by the `fileName` from an S3 bucket identified by `bucketName`.
   *
   * This function constructs and sends a `DeleteObjectCommand` to AWS S3, targeting the specified file within the given bucket.
   * It's designed to handle the deletion of files from S3, ensuring that unnecessary or unwanted files can be programmatically removed
   * from storage to maintain cleanliness and manage storage costs.
   *
   * Upon successful deletion, the function returns `true` to indicate the operation's success. If the deletion process encounters any errors,
   * such as issues with AWS credentials, network errors, or trying to delete a non-existent file, the function will throw an error, which should
   * be caught and handled by the caller.
   *
   * @param {string} bucketName - The name of the S3 bucket from which the file will be deleted.
   * @param {string} fileName - The key (name) of the file to be deleted from the S3 bucket.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the file is successfully deleted.
   * @throws {Error} Throws an error if there's an issue in the deletion process, which could be due to various reasons like network issues, access permissions, etc.
   */
  removeS3Object: async (bucketName: string, fileName: string) => {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    try {
      await s3Client.send(command);
      return true;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Creates a new application request in the database and returns the unique identifier of the created request.
   *
   * This function generates a unique identifier for the new app request using `crypto.randomBytes`. It then constructs
   * a new item containing the request details along with the `performingUser` and a default status of "pending".
   * This item is inserted into a DynamoDB table specified by `tableName`.
   *
   * Upon successful insertion of the new app request into the database, the function returns the generated unique identifier (`id`).
   * If the database operation encounters an error, such as connectivity issues or permission errors, the function will throw an error,
   * which should be caught and handled by the caller.
   *
   * @param {AppRequestType} request - An object containing the details of the new app request, adhering to the `AppRequestType` structure.
   * @param {string} performingUser - The identifier (such as an email or username) of the user who is creating the new app request.
   * @returns {Promise<string>} A promise that resolves to the unique identifier of the newly created app request.
   * @throws {Error} Throws an error if there's an issue during the database operation, which needs to be caught and handled by the caller.
   */
  createNewAppRequest: async (
    request: AppRequestType,
    performingUser: string
  ): Promise<string> => {
    const id = crypto.randomBytes(4).toString("hex");

    const params = {
      TableName: tableName,
      Item: {
        id,
        performingUser,
        status: "pending",
        ...request,
      },
    };

    try {
      await dynamoDB.send(new PutCommand(params));
      return id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetches all application requests from the database.
   *
   * This function performs a full scan of the DynamoDB table specified by `tableName` to retrieve all items,
   * representing application requests stored within. Each item fetched from the database is in the DynamoDB's native
   * format and needs to be unmarshalled into a more readable and usable format.
   *
   * The function utilizes AWS SDK's `ScanCommand` to execute the scan operation. Upon successful retrieval of the items,
   * it maps over each item, applying the `unmarshall` function to convert each item from the DynamoDB record format to
   * a plain JavaScript object.
   *
   * If the scan operation encounters any issues, such as connectivity problems or permission errors, the function will throw an error.
   * This error should be caught and handled appropriately by the caller.
   *
   * @returns {Promise<Object[]>} A promise that resolves to an array of objects, each representing an application request in a readable format.
   * @throws {Error} Throws an error if there's an issue during the scan operation, which needs to be caught and handled by the caller.
   */
  getAllRequests: async () => {
    const params = {
      TableName: tableName,
    };

    try {
      const response = await dynamoDB.send(new ScanCommand(params));
      return response.Items.map((item) => unmarshall(item));
    } catch (error) {
      throw error;
    }
  },
  /**
   * Retrieves multiple application requests from the database based on their IDs.
   *
   * This function fetches application requests from the database by their IDs using a batch get operation.
   * It accepts an array of request IDs and constructs a batch request to fetch the corresponding items
   * from the DynamoDB table specified as 'requests'.
   *
   * Before initiating the batch get operation, the function performs basic input validation to ensure
   * that the input 'ids' parameter is a non-empty array of strings. It also checks whether the number of
   * IDs provided exceeds the maximum limit of 100, as DynamoDB has a limitation on the number of items
   * that can be retrieved in a single batch operation.
   *
   * If the input array is empty or if it contains more than 100 IDs, the function returns an empty array
   * or throws an error, respectively.
   *
   * Upon successfully retrieving the items from the database, the function unmarshalls each item,
   * converting them from DynamoDB's native format to plain JavaScript objects.
   *
   * If the batch get operation encounters any issues, such as connectivity problems or permission errors,
   * the function throws an error. This error should be caught and handled appropriately by the caller.
   *
   * @param {string[]} ids An array of strings representing the IDs of the application requests to retrieve.
   * @returns {Promise<Object[]>} A promise that resolves to an array of objects, each representing an application request in a readable format.
   * @throws {Error} Throws an error if the input 'ids' parameter is invalid (empty or exceeding 100 IDs) or if there's an issue during the batch get operation.
   */
  getRequestsByIds: async (ids: string[]) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    if (ids.length > 100) {
      throw new Error("Cannot fetch more than 100 items at once.");
    }

    const keys = ids.map((id) => ({ id: { S: id } }));

    const params = {
      RequestItems: {
        requests: {
          Keys: keys,
        },
      },
    };

    try {
      const command = new BatchGetItemCommand(params);
      const response = await dynamoDB.send(command);

      if (response.Responses && response.Responses["requests"]) {
        return response.Responses["requests"].map((item) => unmarshall(item));
      }

      return [];
    } catch (error) {
      throw error;
    }
  },
};
