import jwt from "jsonwebtoken";
import { JWTPAYLOAD } from "../types";

export const generateToken = (jwtPayload: JWTPAYLOAD) => {
  return jwt.sign({ ...jwtPayload }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};
