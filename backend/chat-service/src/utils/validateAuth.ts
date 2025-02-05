import jwt, { JwtPayload } from "jsonwebtoken";

type JWTPayload = {
  userId: number;
  email: string;
  name: string | null;
};

export function validateAuth(
  token: string | undefined
): [boolean, JWTPayload | null] {
  if (!token) {
    return [false, null];
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return [true, decoded];
  } catch (error) {
    console.error("JWT verification failed:", error);
    return [false, null];
  }
}
