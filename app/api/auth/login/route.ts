import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/db/collections";
import { signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Both identifier and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    const usersCol = await getUsersCollection();

    // Case-insensitive identifier matching
    const user = await usersCol.findOne({
      identifier: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found. Please verify your ID or contact your administrator.",
        },
        { status: 401 }
      );
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Please try again or check default demo credentials.",
        },
        { status: 401 }
      );
    }

    // Generate signed JWT token
    const token = await signAuthToken({
      userId: user._id ? user._id.toString() : "",
      identifier: user.identifier,
      role: user.role,
      name: user.name,
      email: user.email,
      department: user.department,
    });

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        identifier: user.identifier,
        role: user.role,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });

    // Set HTTP-only secure cookie
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
    const err = error as Error;
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
