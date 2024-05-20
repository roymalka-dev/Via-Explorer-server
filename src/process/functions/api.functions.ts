import { appService } from "../../services/db.services/app.db.services";
import { googleServices } from "../../services/api.services/google.services";
import dotenv from "dotenv";
import { AppType } from "../../types/app.types";
import moment from "moment";

dotenv.config();
const GOOGLE_API_PSO_SPREADSHEET_ID = process.env.GOOGLE_API_PSO_SPREADSHEET_ID;
const GOOGLE_API_PSO_SHEET_NAME = process.env.GOOGLE_API_PSO_SHEET_NAME;

export const apiFunctions = {
  updatePSOGoogleSheet: async () => {
    const allApps = await appService.getAllApps();
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
              pso: row[1] || "n/a",
              psm: row[7] || "n/a",
            } as AppType)
        );

      //remove all apps in formatteddata which thier ids not exist in all apps
      for (let i = 0; i < formattedData.length; i++) {
        if (!allApps.find((app) => app.id === formattedData[i].id)) {
          formattedData.splice(i, 1);
          i--;
        }
      }

      await appService.updateMultipleApps(formattedData);
    } catch (error) {
      throw error;
    }
  },

  updateAllAppsFromStore: async () => {
    const allApps = await appService.getAllApps();
    console.log("Updating all apps from store...", allApps.length);
    let currentIndex = 0;
    const batchSize = 100;
    const interval = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Function to process each batch
    const processBatch = async () => {
      const appsToUpdate = allApps.slice(
        currentIndex,
        currentIndex + batchSize
      );

      if (appsToUpdate.length === 0) {
        console.log("All apps have been updated.");
        return; // Stop further execution
      }

      for (const app of appsToUpdate) {
        try {
          const appStoreData = await appService.searchAppInStore(
            "appstore",
            app.iosAppId
          );
          const playStoreData = await appService.searchAppInStore(
            "playstore",
            app.androidAppId
          );

          if (appStoreData) {
            app.imageUrl = appStoreData.artworkUrl512;
            app.iosBundleId = appStoreData.bundleId;
            app.iosLink = appStoreData.trackViewUrl;
            app.lastStoreUpdate = moment.now();
            app.iosVersion = appStoreData.version;
            app.iosRelease = appStoreData.releaseDate.split("T")[0];
            app.iosScreenshots = appStoreData.screenshotUrls;
            app.iosCurrentVersionReleaseDate =
              appStoreData.currentVersionReleaseDate.split("T")[0];
            app.languages = appStoreData.languageCodesISO2A;
            //app.iosAppId = appStoreData.trackId;
          }

          if (playStoreData) {
            if (!app.imageUrl) app.imageUrl = playStoreData.icon;
            app.androidLink = playStoreData.url;
            app.androidVersion = playStoreData.version;
            app.lastStoreUpdate = moment.now();
            app.androidScreenshots = playStoreData.screenshots;
            app.androidCurrentVersionReleaseDate = new Date(
              playStoreData.updated
            )
              .toISOString()
              .split("T")[0];
            //app.androidAppId = playStoreData.appId;
          }

          await appService.updateMultipleApps([app]); // Update app in database
        } catch (error) {
          console.error("Error updating app:", app.name, error);
        }
      }

      currentIndex += batchSize;
      setTimeout(processBatch, interval); // Schedule the next batch
    };

    processBatch();
  },
};
