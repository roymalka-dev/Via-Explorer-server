import cron from "node-cron";

import { apiFunctions } from "./functions/api.functions";
import logger from "../logger/logger";

const scheduler = cron.schedule("0 0 * * *", () => {
  /*
  apiFunctions
    .updatePSOGoogleSheet()
    .then(() => {
      logger.info("Update PSO list successfully!", {
        tag: "info",
        location: "scheduler.ts",
      });
    })
    .catch((error) => {
      logger.error("Error updating PSO list", {
        tag: "error",
        location: "scheduler.ts",
        error: error.message,
      });
    });
  */

  apiFunctions
    .updateAllAppsFromStore()
    .then(() => {
      logger.info("Update all apps from store successfully!", {
        tag: "info",
        location: "scheduler.ts",
      });
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
