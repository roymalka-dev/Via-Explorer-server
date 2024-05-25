import { Request, Response } from "express";
import { logsServices } from "../services/logs.services/logs.services";
import logger from "../logger/logger";

export const logsControllers = {
  getLogsByDate: async (req: Request, res: Response) => {
    const date = req.query.date;
    try {
      const logs = await logsServices.getLogsByDate(String(date));
      res.status(200).json({ data: logs });
    } catch (error) {
      logger.error(`Failed to retrieve logs for date ${date}`, {
        tag: "error",
        location: "logs.controllers.ts",
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      res.status(500).send("Failed to retrieve logs");
    }
  },
};
