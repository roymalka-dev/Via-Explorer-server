import express from "express";
import { serverConfig } from "./configs/server.config";
import { router } from "./routes/router";
import dotenv from "dotenv";
import { setConfigurations } from "./utils/configurations.utils";
import { routes } from "./routes/routes";
import { startScheduler } from "./process/scheduler";
import logger from "./logger/logger";

dotenv.config();
const port = Number(process.env.PORT || 3000);
const hostname =
  process.env.NODE_ENV === "DEV"
    ? process.env.LOCAL_HOST_URL
    : process.env.PRODUCTION_URL;
const apiPrefix = process.env.API_PREFIX || "";

const server = express();
serverConfig(server);

router(apiPrefix, server, routes);

server.get("/", (req, res) => {
  res.json({ message: "Via Explorer API v1" });
});

setConfigurations()
  .then(() => {
    server.listen(port, hostname, () => {
      logger.info(`Server started, running on ${hostname}:${port}`, {
        tag: "server",
        location: "server.ts",
      });

      startScheduler();
    });
  })
  .catch((error) => {
    logger.error(`Error setting configurations: ${error}`);
  });
