import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateSchema =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.safeParse(req.body);
      next();
    } catch (error) {
      console.log(error);
    }
  };
