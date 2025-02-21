import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

export async function verifyGoogleToken(token: string) {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

export const generateRandomPassword = (): string => {
  return crypto.randomBytes(8).toString("hex");
};
