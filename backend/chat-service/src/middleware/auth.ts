import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthPayload = {
  userId: number;
  email: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.jwt;
  
  if (!token) return;

  const user = jwt.verify(token, process.env.JWT_SECRET!);

  if (typeof user == "string") {
    return;
  }

  req.user = <AuthPayload>user;

  console.log(req.user, "====");

  next();
}
