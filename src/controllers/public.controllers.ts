import logger from "../logger/logger";
import { appService } from "../services/db.services/app.db.services";
import { Request, Response } from "express";

export const publicControllers = {
  getCityData: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await appService.getAppById(id);
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
};
