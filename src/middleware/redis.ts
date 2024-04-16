import { redis } from "../db/redis";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const redisGetRequestCache: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method !== "GET") {
    return next();
  }

  const key = `get-request-${req.originalUrl || req.url}`;

  try {
    const cachedData = await redis.get(key);
    if (cachedData != null) {
      res.setHeader("X-Cache", "HIT");
      res.send(JSON.parse(cachedData));
    } else {
      const originalSend = res.send.bind(res);
      res.send = (body: any): Response<any, Record<string, any>> => {
        redis
          .set(key, JSON.stringify(body), "EX", 1800) // Cache for 1/2 hour
          .catch((err: any) => console.error("Redis set error:", err));
        return originalSend(body);
      };
      next();
    }
  } catch (err) {
    console.error("Redis get error:", err);
    next(err);
  }
};
