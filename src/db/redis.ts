import Redis from "ioredis";
import logger from "../logger/logger";

export const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});

export const startRedisClient = () => {
  try {
    redis.on("connect", () => {
      logger.info("Redis client connected", {
        tag: "redis",
        location: "redis.ts",
      });
    });

    redis.on("error", (err) => {
      throw err;
    });
  } catch (err) {
    logger.error("Error starting Redis client", {
      tag: "error",
      location: "redis.ts",
      error: err.message,
    });
  }
};
