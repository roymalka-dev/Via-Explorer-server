import { AppType } from "../types/app.types";
import { appService } from "../services/db.services/app.db.services";
import moment from "moment";
import { userService } from "../services/db.services/users.db.services";
import { getConfigValue } from "../utils/configurations.utils";
import { Request, Response } from "express";
import { apiFunctions } from "../process/functions/api.functions";
import logger from "../logger/logger";
import { flexityServices } from "../services/api.services/flexity.services";
import { extractElementByType } from "../utils/data.utils";

export const appControllers = {
  /**
   * Retrieves detailed information for a specific application identified by its ID.
   *
   * This controller handles an HTTP GET request. It first checks if the requested app exists in the database.
   * If the app is found, it then checks if the app's store data (from both the App Store and Play Store)
   * is outdated by comparing the current time with the last store update timestamp.
   * If the store data is outdated or missing, it fetches the latest data from the stores, updates the app details,
   * and saves the updated details back to the database.
   *
   * Additionally, the controller updates the user's list of recently viewed apps.
   *
   * @param {Request} req - The Express request object. Expects an 'id' parameter in the URL path.
   * @param {Response} res - The Express response object used for sending back the app data or an error message.
   *
   * Successful response format:
   * {
   *   "data": {
   *     "id": "app_id",
   *     "name": "App Name",
   *     ... // other app details
   *   }
   * }
   *
   * Responds with a 404 status code if the app is not found, and a 500 status code for internal server errors.
   * Errors during the process are logged to the console for debugging purposes.
   */
  getAppController: async (req: Request, res: Response) => {
    const TIME_TO_UPDATE_APP_FROM_STORE_IN_MIN = Number(
      getConfigValue("TIME_TO_UPDATE_APP_FROM_STORE_IN_MIN", 60)
    );
    try {
      const { id } = req.params;

      const item = await appService.getAppById(id);

      if (!item) {
        return res.status(404).json({ message: "App not found" });
      }

      if (
        moment().diff(moment(item.lastStoreUpdate), "minutes") >=
          TIME_TO_UPDATE_APP_FROM_STORE_IN_MIN ||
        !item.lastStoreUpdate
      ) {
        const appStoreData = await appService.searchAppInStore(
          "appstore",
          item.iosAppId
        );
        const playSotreData = await appService.searchAppInStore(
          "playstore",
          item.androidAppId
        );

        if (appStoreData) {
          item.imageUrl = appStoreData.artworkUrl512;
          item.iosLink = appStoreData.trackViewUrl;
          item.iosBundleId = appStoreData.bundleId;
          item.lastStoreUpdate = moment.now();
          item.iosVersion = appStoreData.version;
          item.iosRelease = appStoreData.releaseDate.split("T")[0];
          item.iosScreenshots = appStoreData.screenshotUrls;
          item.languages = appStoreData.languageCodesISO2A;
          item.iosCurrentVersionReleaseDate =
            appStoreData.currentVersionReleaseDate.split("T")[0];
        }

        if (playSotreData) {
          if (!item.imageUrl) item.imageUrl = playSotreData.icon;
          item.androidLink = playSotreData.url;
          item.androidVersion = playSotreData.version;
          item.lastStoreUpdate = moment.now();
          item.androidScreenshots = playSotreData.screenshots;
          item.androidCurrentVersionReleaseDate = new Date(
            playSotreData.updated
          )
            .toISOString()
            .split("T")[0];
        }

        await appService.addNewApp(item); //update
      }

      await userService.updateUserRecentlyViewed(req.session.user, id);

      res.status(200).json({ data: item });
    } catch (error) {
      logger.error("Error retrieving app", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal server error", error });
    }
  },

  /**
   * Retrieves a list of all applications stored in the database.
   *
   * This controller handles an HTTP GET request and does not require any URL parameters or request body.
   * It invokes a service function to fetch all app details from the database. If any apps are found,
   * it returns them in an array. If no apps are found, it responds with a 404 status indicating no apps were found.
   *
   * @param {Request} req - The Express request object. This endpoint does not use request parameters.
   * @param {Response} res - The Express response object used for sending back the list of apps or an error message.
   *
   * Successful response format (when apps are found):
   * {
   *   "data": [
   *     { app details object 1 },
   *     { app details object 2 },
   *     ...
   *   ]
   * }
   *
   * Responds with a 404 status code if no apps are found in the database, and a 500 status code for internal server errors.
   * Any errors encountered during the process are logged to the console for debugging purposes.
   */
  getAllAppsController: async (req: Request, res: Response) => {
    try {
      const items = await appService.getAllApps();

      if (items.length > 0) {
        res.status(200).json({ data: items });
      } else {
        res.status(404).json({ message: "No apps found" });
      }
    } catch (error) {
      logger.error("Error retrieving apps", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });

      res.status(500).json({ message: "Internal server error", error });
    }
  },

  /**
   * Updates an application in the database.
   *
   * This controller handles an HTTP PUT request containing the updated application data in the request body.
   * It first checks if the requested app exists in the database. If the app is found, it updates the app's details
   * with the provided data and saves the changes back to the database.
   *
   * The controller responds with a success message if the update is completed successfully.
   * If the app is not found, it responds with a 404 status code and a message indicating the app was not found.
   * In case of internal server errors during the update process, it responds with a 500 status code and an error message.
   *
   * @param {Request} req - The Express request object, containing the updated app data in the body.
   * @param {Response} res - The Express response object used for sending back a success message or an error message.
   *
   * Successful response format:
   * {
   *   "message": "App updated successfully"
   * }
   *
   * Responds with a 404 status code if the app is not found, and a 500 status code for internal server errors.
   * Errors encountered during the process are logged to the console for debugging purposes.
   */
  updateAppController: async (req: Request, res: Response) => {
    try {
      const appData = req.body;

      const app = await appService.getAppById(appData.id);

      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }

      await appService.updateMultipleApps([appData]);

      res.status(200).json({ message: "App updated successfully" });
    } catch (error) {
      logger.error("Error updating app", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal server error", error });
    }
  },

  /**
   * Retrieves a list of applications based on an array of provided IDs.
   *
   * This controller handles a POST request where the body contains an array of application IDs.
   * It queries the database for the apps corresponding to these IDs and returns them in the response.
   *
   * @param {Request} req - The Express request object, expected to contain an array of app IDs in the body.
   * @param {Response} res - The Express response object used for sending back the retrieved apps or an error message.
   *
   * Request body format:
   * {
   *   "ids": ["id1", "id2", ...]
   * }
   *
   * Successful response format:
   * [
   *   { app details object 1 },
   *   { app details object 2 },
   *   ...
   * ]
   *
   * Errors are logged to the console and an appropriate HTTP status code and message are returned to the client.
   */
  getAppsByIds: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      const apps = await appService.getAppsByIds(ids);

      res.json(apps);
    } catch (error) {
      logger.error("Error retrieving apps by IDs", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  /**
   * Adds a new application to the database.
   *
   * This controller handles an HTTP POST request containing application data in the request body.
   * It first attempts to fetch additional app details from the App Store using the provided app name.
   * If successful, it enriches the incoming app data with the fetched information, including the app's
   * image URL, iOS link, last store update timestamp, and iOS version.
   *
   * The enriched app data is then passed to a service function to be added to the database.
   * The response indicates whether the addition was successful or not.
   *
   * @param {Request} req - The Express request object, containing the new application data in the body.
   * @param {Response} res - The Express response object used for sending back a success message or an error message.
   *
   * Expected request body format:
   * {
   *   "name": "App Name", // Other app details follow...
   * }
   *
   * Successful response format:
   * {
   *   "message": "App added successfully"
   * }
   *
   * The function responds with a 400 status code if adding the app fails, and a 500 status code for internal server errors.
   * All encountered errors are logged to the console for debugging purposes.
   */
  addNewAppController: async (req: Request, res: Response) => {
    try {
      let app: AppType = req.body;

      //check if id available
      const existingApp = await appService.getAppById(String(app.id));
      if (existingApp) {
        return res.status(400).json({ message: "App already exists" });
      }

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
        app.iosLink = appStoreData.trackViewUrl;
        app.lastStoreUpdate = moment.now();
        app.iosVersion = appStoreData.version;
        app.iosRelease = appStoreData.releaseDate;
        app.iosScreenshots = appStoreData.screenshotUrls;
        app.iosCurrentVersionReleaseDate =
          appStoreData.currentVersionReleaseDate;
        app.languages = appStoreData.languageCodesISO2A;
      }

      if (playStoreData) {
        if (!app.imageUrl) app.imageUrl = playStoreData.icon;
        app.androidLink = playStoreData.url;
        app.androidVersion = playStoreData.version;
        app.lastStoreUpdate = moment.now();
        app.androidScreenshots = playStoreData.screenshots;
        app.androidCurrentVersionReleaseDate = new Date(
          playStoreData.updated
        ).toString();
      }

      app.queryName = app.name.toLowerCase();
      app.id = String(app.id);

      const success = await appService.addNewApp(app);

      if (success) {
        res.status(200).json({ message: "App added successfully" });
      } else {
        res.status(400).json({ message: "Failed to add the app" });
      }
    } catch (error) {
      logger.error("Error adding app", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal server error", error });
    }
  },

  /**
   * Adds multiple applications to the database in a single request.
   *
   * This controller handles an HTTP POST request containing an array of application data in the request body.
   * For each application, it attempts to fetch additional details from the App Store using the app's name.
   * If additional details are available, it enriches the app data with this information, including image URLs,
   * iOS links, last store update timestamps, and iOS versions.
   *
   * Each app's data, potentially enriched with additional details, is then attempted to be added to the database.
   * The response for each app indicates whether the addition was successful.
   *
   * @param {Request} req - The Express request object, containing an array of new application data in the body.
   * @param {Response} res - The Express response object used for sending back the results for each app addition attempt.
   *
   * Expected request body format:
   * [
   *   { "name": "App Name 1", ... }, // Other app details...
   *   { "name": "App Name 2", ... }
   * ]
   *
   * Successful response format (array of results for each app):
   * [
   *   { "name": "App Name 1", "success": true, "message": "App added successfully" },
   *   { "name": "App Name 2", "success": false, "message": "Failed to add the app" },
   *   ...
   * ]
   *
   * The function responds with a 500 status code for internal server errors, with each encountered error logged to the console.
   */
  addMultipleAppsController: async (req: Request, res: Response) => {
    try {
      const appsData: AppType[] = req.body;

      const results = [];

      for (const appData of appsData) {
        const appStoreData = await appService.searchAppInStore(
          "appstore",
          appData.name
        );

        if (appStoreData) {
          // Update appData with store details
          appData.imageUrl = appStoreData.artworkUrl512;
          appData.iosLink = appStoreData.trackViewUrl;
          appData.lastStoreUpdate = moment.now();
          appData.iosVersion = appStoreData.version;
        }

        // Attempt to add the app to the database
        const success = await appService.addNewApp(appData);

        // Collect results for each app
        results.push({
          name: appData.name,
          success,
          message: success ? "App added successfully" : "Failed to add the app",
        });
      }

      // Respond with the results for each app
      res.status(200).json(results);
    } catch (error) {
      logger.error("Error adding apps", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal server error", error });
    }
  },

  /**
   * Searches for applications based on a provided query string or retrieves recently viewed apps if no query is provided.
   *
   * This controller handles an HTTP GET request. It first checks for a 'q' query parameter in the request URL.
   * If the query parameter is present, it searches the database for apps matching the query.
   * If the query parameter is not provided, the controller fetches the IDs of recently viewed apps for the current user
   * from the user service and then retrieves these apps from the database.
   *
   * The controller responds with an array of apps that match the search query or the recently viewed apps.
   * If no apps are found, or if there are no recently viewed apps, an empty array is returned.
   *
   * @param {Request} req - The Express request object. May contain a 'q' query parameter for searching apps.
   * @param {Response} res - The Express response object used for sending back the found apps or an error message.
   *
   * Successful response format when apps are found or recently viewed apps are retrieved:
   * {
   *   "data": [
   *     { app details object 1 },
   *     { app details object 2 },
   *     ...
   *   ]
   * }
   *
   * Successful response format when no apps are found:
   * {
   *   "data": []
   * }
   *
   * The function responds with a 500 status code for internal server errors.
   * Errors encountered during the process are logged to the console for debugging purposes.
   */
  searchAppsController: async (req: Request, res: Response) => {
    try {
      let apps;
      const query = req.query.q?.toString().trim().toLowerCase();

      if (query) {
        apps = await appService.searchAppsInDb(query);
      } else {
        let appsIds = await userService.getRecentlyViewed(req.session.user);

        if (appsIds.length < 2) {
          //set default apps ids for new users
          appsIds = [
            "1",
            "454",
            "505",
            "475",
            "99",
            "141",
            "207",
            "608",
            "597",
            "195",
            "298",
            "280",
          ];
        }

        apps = await appService.getAppsByIds(appsIds);

        if (apps.length === 0) {
          return res.status(200).json({ data: [] });
        }
      }

      const formattedApps = apps
        .map((app) => {
          return {
            id: app.id,
            name: app.name,
            city: app.city,
            imageUrl: app.imageUrl,
            region: app.region,
          };
        })
        .slice(0, 30);

      res.status(200).json({ data: formattedApps });
    } catch (error) {
      logger.error("Error searching apps", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  /**
   * Controller for updating multiple applications in the database.
   *
   * This controller receives a request with a JSON body containing an array of application objects.
   * Each object should include the application ID and the attributes to be updated. The controller
   * validates the input, extracts the application data, and passes it to the `updateMultipleApps` service
   * function to perform the update operations in DynamoDB.
   *
   * The controller responds with a success message if the updates are completed successfully.
   * In case of input validation errors or internal errors during the update process, it responds with
   * an appropriate error message and status code.
   *
   * @param req - The HTTP request object, expected to contain an array of application objects in `req.body.apps`.
   * @param res - The HTTP response object used to send back the response.
   */
  updateMultipleAppsController: async (req: Request, res: Response) => {
    try {
      // Validate and extract the apps data from the request body
      const apps = req.body;
      if (!apps || !Array.isArray(apps)) {
        return res
          .status(400)
          .json({ message: "Invalid input: apps must be an array." });
      }

      // Call the service function to update the apps in the DynamoDB table
      await appService.updateMultipleApps(apps);

      // Respond with a success message
      res.status(200).json({ message: "Apps updated successfully." });
    } catch (error) {
      logger.error("Error updating apps", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      // Respond with an error message and the appropriate status code
      res
        .status(500)
        .json({ message: "Failed to update apps due to an internal error." });
    }
  },
  updateAppsFromStores: async (req: Request, res: Response) => {
    try {
      await apiFunctions
        .updateAllAppsFromStore()
        .then(() => {
          res
            .status(200)
            .json({ message: "Started updating all apps from stores" });
        })
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      logger.error("Error updating apps from stores", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal server error", error });
    }
  },
  updatePsmPso: async (req: Request, res: Response) => {
    try {
      await apiFunctions
        .updatePSOGoogleSheet()
        .then(() => {
          res.status(200).json({ message: "all apps updated successfully" });
        })
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      logger.error("Error updating apps from stores", {
        tag: "error",
        location: "app.controllers.ts",
        error: (error as Error).message,
      });
      res.status(500).json({ message: "Internal server error", error });
    }
  },
  updateCityStatusFromFlexity: async (req: Request, res: Response) => {
    try {
      //const status = await flexityServices.getFlexityDataByElement("service_status" );

      //const envs = await flexityServices.getFlexityDataByElement("city_code");

      const city = await flexityServices.getFlexityDataByElement("city_name");

      const country = await flexityServices.getFlexityDataByElement("country");

      // const tenant = await flexityServices.getFlexityDataByElement("tenant_id");
      //const operation = await flexityServices.getFlexityDataByElement("operation_type");

      const schedule = await flexityServices.getFlexityDataByElement(
        "schedule_type"
      );

      const region = await flexityServices.getFlexityDataByElement(
        "server_region"
      );
      const timezone = await flexityServices.getFlexityDataByElement(
        "timezone"
      );
      const stack = await flexityServices.getFlexityDataByElement(
        "stack_version"
      );
      const service = await flexityServices.getFlexityDataByElement("use_Case");
      const subservices = await flexityServices.getFlexityDataByElement(
        "subservices"
      );

      //const formattedStatus = extractElementByType(status,"service_status","serviceStatus");

      //const formattedEnv = extractElementByType(envs, "city_code", "env");

      //const formattedCity = extractElementByType(city, "city_name", "city");

      //const formattedCountry = extractElementByType(country,"country", "country");

      // const formattedTenant = extractElementByType(tenant, "tenant_id", "tenant");

      //const formattedOperation = extractElementByType(operation,"operation_type", "operationType");

      const formattedSchedule = extractElementByType(
        schedule,
        "schedule_type",
        "scheduleType"
      );
      const formattedRegion = extractElementByType(
        region,
        "server_region",
        "region"
      );
      const formattedTimezone = extractElementByType(
        timezone,
        "cityTimezone",
        "timezone"
      );
      const formattedStack = extractElementByType(
        stack,
        "stack_version",
        "stack"
      );
      const formattedService = extractElementByType(
        service,
        "use_case",
        "serviceType"
      );
      const formattedSubservices = extractElementByType(
        subservices,
        "subservices",
        "subservices"
      );

      await appService.updateMultipleApps(formattedSchedule as any);
      await appService.updateMultipleApps(formattedRegion as any);
      await appService.updateMultipleApps(formattedTimezone as any);
      await appService.updateMultipleApps(formattedStack as any);
      await appService.updateMultipleApps(formattedService as any);
      await appService.updateMultipleApps(formattedSubservices as any);

      return res.status(200).json({ data: formattedSchedule });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  },
};
