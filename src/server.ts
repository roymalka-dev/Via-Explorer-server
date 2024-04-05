import express from "express";
import { serverConfig } from "./configs/server.config";
import { routes } from "./configs/routes.config/routes.config";
import { router } from "./routes/router";
import dotenv from "dotenv";
import { setConfigurations } from "./utils/configurations.utils";

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

setConfigurations().then(() => {
  server.listen(port, hostname, () => {
    console.log(`Server is running on  ${hostname}:${port}`);
  });
});
