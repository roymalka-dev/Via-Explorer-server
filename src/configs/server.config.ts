import bodyParser from "body-parser";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import helmet from "helmet";
import { getConfigValue } from "../utils/configurations.utils";
import dotenv from "dotenv";
import { redis, startRedisClient } from "../db/redis";
import RedisStore from "connect-redis";
dotenv.config();

declare module "express-session" {
  interface SessionData {
    user: string;
    authorization: string;
  }
}
export const serverConfig = (server: Application) => {
  const TIME_TO_END_SERVER_USER_SESSION_IN_HR = Number(
    getConfigValue("TIME_TO_END_SERVER_USER_SESSION_IN_HR", 12)
  );

  startRedisClient();

  server.use(express.json());
  server.use(bodyParser.json({ limit: "30mb" }));
  server.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
  server.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  server.use(
    session({
      store: new RedisStore({ client: redis }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "DEV" ? false : false,
        httpOnly: true,
        maxAge: TIME_TO_END_SERVER_USER_SESSION_IN_HR * 60 * 60 * 1000,
      },
    })
  );
  /*

  server.use(
    cors({
      credentials: true,
      origin: "*",
    })
  );*/

  server.use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === "DEV"
          ? [process.env.LOCAL_HOST_URL_CORS, process.env.APPLE_API_URL]
          : [
              process.env.PRODUCTION_CORS_URL1,
              process.env.PRODUCTION_CORS_URL2,
              process.env.PRODUCTION_CORS_URL3,
              process.env.PRODUCTION_CORS_URL4,
              process.env.PRODUCTION_CORS_URL5,
              process.env.PRODUCTION_CORS_URL6,
              process.env.APPLE_API_URL,
              "*",
            ],
    })
  );
  process.env.NODE_ENV === "DEV"
    ? server.use(morgan("common"))
    : server.use(morgan("tiny"));
};
