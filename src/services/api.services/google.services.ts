import { OAuth2Client } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.GOOGLE_API_PRIVATE_KEY?.replace(/\\n/g, "\n");

const GOOGLE_API_KEY_JSON = {
  type: "service_account",
  project_id: "via-explorer-418007",
  private_key_id: process.env.GOOGLE_API_PRIVATE_KEY,
  private_key: privateKey,
  client_email: "via-explorer@via-explorer-418007.iam.gserviceaccount.com",
  client_id: process.env.GOOGLE_API_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/via-explorer%40via-explorer-418007.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const auth = new google.auth.GoogleAuth({
  credentials: GOOGLE_API_KEY_JSON,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

export const googleServices = {
  getGoogleSpreadSheetData: async (
    spreadsheetId: string,
    sheetName: string
  ) => {
    try {
      const client = await auth.getClient();

      const sheets = google.sheets({
        version: "v4",
        auth: client as OAuth2Client,
      });

      const range = `${sheetName}!A:Z`;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values;
    } catch (error) {
      throw error;
    }
  },
};
