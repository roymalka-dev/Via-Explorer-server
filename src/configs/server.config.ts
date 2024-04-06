import bodyParser from "body-parser";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import helmet from "helmet";
import { getConfigValue } from "../utils/configurations.utils";

export const serverConfig = (server: Application) => {
  const TIME_TO_END_SERVER_USER_SESSION_IN_HR = Number(
    getConfigValue("TIME_TO_END_SERVER_USER_SESSION_IN_HR", 12)
  );

  server.use(express.json());
  server.use(bodyParser.json({ limit: "30mb" }));
  server.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
  server.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
  server.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        maxAge: TIME_TO_END_SERVER_USER_SESSION_IN_HR * 60 * 60 * 1000,
      },
    })
  );

  server.use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === "DEV" ? process.env.LOCAL_HOST_URL_CORS : "*",
    })
  );

  /*
  server.use(
    cors({
      credentials: true,
      allowedHeaders: [
        "X-CSRF-Token",
        "X-Requested-With",
        "Accept",
        "Accept-Version",
        "Content-Length",
        "Content-MD5",
        "Content-Type",
        "Date",
        "X-Api-Version",
        "Authorization",
      ],

      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      origin:
        process.env.NODE_ENV === "DEV"
          ? [process.env.LOCAL_HOST_URL_CORS, process.env.APPLE_API_URL]
          : [process.env.PRODUCTION_CORS_URL, process.env.APPLE_API_URL],
    })
  );
  */

  process.env.NODE_ENV === "DEV" && server.use(morgan("common"));
};
