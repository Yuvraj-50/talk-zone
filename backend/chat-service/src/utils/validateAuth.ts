import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { JWTPAYLOAD } from "../types";

type ValidateAuthReturn = [boolean, JWTPAYLOAD | null];

export function validateAuth(token: string | undefined): ValidateAuthReturn {
  if (!token) {
    return [false, null];
  }
  try {
    const verifyOutput: ValidateAuthReturn = [false, null];
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: VerifyErrors | null, user: unknown) => {
        if (err) {
          return [false, null];
        }
        const payload = user as JWTPAYLOAD;
        verifyOutput[0] = true;
        verifyOutput[1] = payload;
      }
    );
    console.log(verifyOutput);
    
    return verifyOutput;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return [false, null];
  }
}
