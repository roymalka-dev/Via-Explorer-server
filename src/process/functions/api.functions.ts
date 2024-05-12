import { appService } from "../../services/db.services/app.db.services";
import { googleServices } from "../../services/api.services/google.services";
import dotenv from "dotenv";
import { AppType } from "../../types/app.types";
import moment from "moment";
import {
  setIntervalAsync,
  clearIntervalAsync,
} from "set-interval-async/dynamic";

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
  updateAllAppsFromStore: async () => {
    const allApps = await appService.getAllApps();
    let currentIndex = 0;
    const batchSize = 100;
    const interval = 15 * 60 * 1000; // 15 minutes in milliseconds

    const intervalId = setIntervalAsync(async () => {
      const appsToUpdate = allApps.slice(
        currentIndex,
        currentIndex + batchSize
      );
      if (appsToUpdate.length === 0) {
        await clearIntervalAsync(intervalId);
        return;
      }

      for (const app of appsToUpdate) {
        try {
          const appStoreData = await appService.searchAppInStore(
            "appstore",
            app.name
          );
          const playStoreData = await appService.searchAppInStore(
            "playstore",
            app.name
          );

          if (appStoreData) {
            app.imageUrl = appStoreData.artworkUrl512;
            app.iosLink = appStoreData.trackViewUrl;
            app.lastStoreUpdate = moment.now();
            app.iosVersion = appStoreData.version;
            app.iosRelease = appStoreData.releaseDate;
            app.iosScreenshots = appStoreData.screenshotUrls;
            app.languages = appStoreData.languageCodesISO2A;
          }

          if (playStoreData) {
            if (!app.imageUrl) app.imageUrl = playStoreData.icon;
            app.androidLink = playStoreData.url;
            app.androidVersion = playStoreData.version;
            app.lastStoreUpdate = moment.now();
            app.androidScreenshots = playStoreData.screenshots;
          }

          await appService.addNewApp(app); // update app in database
        } catch (error) {
          console.error("Error updating app:", app.name, error);
        }
      }

      currentIndex += batchSize;
    }, interval);
  },
};
