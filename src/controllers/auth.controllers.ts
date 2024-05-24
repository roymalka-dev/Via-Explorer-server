import { Request, Response } from "express";

export const authControllers = {
  verify: async (req: Request, res: Response) => {
    res.status(200).send({ message: "Authorized" });
  },
};
