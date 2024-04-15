import { appService } from "../../services/db.services/app.db.services";
import { googleServices } from "../../services/api.services/google.services";
import dotenv from "dotenv";
import { AppType } from "../../types/app.types";
dotenv.config();
const GOOGLE_API_PSO_SPREADSHEET_ID = process.env.GOOGLE_API_PSO_SPREADSHEET_ID;
const GOOGLE_API_PSO_SHEET_NAME = process.env.GOOGLE_API_PSO_SHEET_NAME;

export const apiFunctions = {
  updatePSOGoogleSheet: async () => {
    try {
      const data = await googleServices.getGoogleSpreadSheetData(
        GOOGLE_API_PSO_SPREADSHEET_ID,
        GOOGLE_API_PSO_SHEET_NAME
      );

      const formattedData = data
        .slice(1)
        .filter((row) => row[0])
        .map(
          (row) =>
            ({
              id: row[0],
              pso: row[1] || "",
              psm: row[7] || "",
            } as AppType)
        );

      await appService.updateMultipleApps(formattedData);
    } catch (error) {
      throw error;
    }
  },
};
