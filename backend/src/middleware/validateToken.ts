import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Acceso denegado. No se proveyó un token." });
    }
    const token = authHeader?.split(" ")[1];

    if (!process.env.ACCES_TOKEN_SECRET) {
      throw new Error("accessToken secret are not provided");
    }

    const decoded = jwt.verify(token, process.env.ACCES_TOKEN_SECRET) as {
      id: string;
    };

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};
