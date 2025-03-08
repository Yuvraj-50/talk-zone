import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { JWTPAYLOAD } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPAYLOAD;
    }
  }
}

export async function authMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.jwt;

  if (!token) {
    res.json("invalid token no access token");
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    (err: VerifyErrors | null, user: unknown) => {
      if (err) {
        res.status(401).json({ msg: "not Authenticated user" });
        return;
      }
      req.user = user as JWTPAYLOAD;
      next();
    }
  );
}
