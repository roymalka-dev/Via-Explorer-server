import cron from "node-cron";

import { apiFunctions } from "./functions/api.functions";

const scheduler = cron.schedule("0 0 * * *", () => {
  /*
  apiFunctions
    .updatePSOGoogleSheet()
    .then(() => {
      console.log("Update PSO list successfully!");
    })
    .catch((error) => {
      console.error(error);
    });
  */

  apiFunctions
    .updateAllAppsFromStore()
    .then(() => {
      console.log("Updated all apps from store successfully!");
    })
    .catch((error) => {
      console.error(error);
    });
});

export const startScheduler = () => {
  scheduler.start();
};
