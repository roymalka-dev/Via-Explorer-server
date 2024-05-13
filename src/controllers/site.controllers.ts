import { Request, Response } from "express";
import { siteServices } from "../services/db.services/site.db.services";

export const siteControllers = {
  getLatestAnnouncements: async (req: Request, res: Response) => {
    try {
      const announcements = await siteServices.getAnnouncements();

      const lastThreeAnnouncements =
        announcements.data.length > 3
          ? announcements.data.slice(-3)
          : announcements.data;

      res.status(200).json({
        data: lastThreeAnnouncements,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  },
};
