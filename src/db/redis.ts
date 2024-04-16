import Redis from "ioredis";

export const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});

export const startRedisClient = () => {
  try {
    redis.on("connect", () => {
      console.log("Connected to Redis");
    });

    redis.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  } catch (err) {
    console.error("Error while connecting to Redis", err);
  }
};
