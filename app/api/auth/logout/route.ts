import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { apiSuccess } from "@/lib/api/response";

export async function POST() {
  const response = apiSuccess({
    message: "Logged out successfully.",
  });

  // Clear session cookie securely
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
