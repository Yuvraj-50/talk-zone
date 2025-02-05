import jwt from "jsonwebtoken";

type payload = {
  userId: number;
  email: string;
  name: string | null;
};

export const generateToken = (jwtPayload: payload) => {
  return jwt.sign({ ...jwtPayload }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};


