import cron from "node-cron";

import { apiFunctions } from "./functions/api.functions";
import logger from "../logger/logger";

const scheduler = cron.schedule("0 0 * * *", () => {
  apiFunctions
    .updatePSOGoogleSheet()
    .then(() => {
      console.log("Update PSO list successfully!");
    })
    .catch((error) => {
      logger.error("Error updating PSO list", {
        tag: "error",
        location: "scheduler.ts",
        error: error.message,
      });
    });

  apiFunctions
    .updateAllAppsFromStore()
    .then(() => {
      console.log("Updated all apps from store successfully!");
    })
    .catch((error) => {
      logger.error("Error updating all apps from store", {
        tag: "error",
        location: "scheduler.ts",
        error: error.message,
      });
    });
});

export const startScheduler = () => {
  scheduler.start();
};
