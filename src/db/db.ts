import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: defaultProvider(),
});
export const dynamoDB = DynamoDBDocumentClient.from(client);

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: defaultProvider(),
});
