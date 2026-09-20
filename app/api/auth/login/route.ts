import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/db/collections";
import { signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== "string" || !password || typeof password !== "string") {
      return apiError("BAD_REQUEST", "Both identifier and password are required.", 400);
    }

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      return apiError("BAD_REQUEST", "Both identifier and password are required.", 400);
    }

    const usersCol = await getUsersCollection();

    // Look up user by identifier (case-insensitive)
    const user = await usersCol.findOne({
      identifier: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") },
    });

    if (!user) {
      // Return generic error without revealing whether account exists
      return apiError("INVALID_CREDENTIALS", "Invalid ID or password.", 401);
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return apiError("INVALID_CREDENTIALS", "Invalid ID or password.", 401);
    }

    // Generate signed cryptographic JWT token
    const token = await signAuthToken({
      userId: user._id ? user._id.toString() : "",
      identifier: user.identifier,
      role: user.role,
      name: user.name,
      email: user.email,
      department: user.department,
    });

    const safeUser = {
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      department: user.department,
    };

    const response = apiSuccess({
      user: safeUser,
    });

    // Set secure HttpOnly session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Login API error:", error);
    return apiError("SERVER_ERROR", "Unable to sign in right now. Please try again.", 500);
  }
}
