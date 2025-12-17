import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateSchema =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res
          .status(400)
          .json({ errors: result.error.flatten().fieldErrors });
      }
      next();
    } catch (error) {
      res.status(500).json({ errors: ["Internal server error"] });
    }
  };
