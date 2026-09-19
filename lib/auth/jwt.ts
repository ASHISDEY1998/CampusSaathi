import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/types";

const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET ||
    "campus_saathi_default_jwt_secret_key_minimum_32_characters_long!";
  return new TextEncoder().encode(secret);
};

export const AUTH_COOKIE_NAME = "campus_auth_session";

export interface AuthSessionPayload {
  userId: string;
  identifier: string;
  role: UserRole;
  name: string;
  email: string;
  department: string;
}

/**
 * Signs a cryptographic JWT session token valid for 7 days.
 */
export async function signAuthToken(payload: AuthSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

/**
 * Verifies a JWT session token and returns the decoded payload, or null if invalid/expired.
 */
export async function verifyAuthToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AuthSessionPayload;
  } catch {
    return null;
  }
}
