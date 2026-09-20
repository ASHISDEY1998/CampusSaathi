import { NextResponse } from "next/server";

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorDetail;
}

/**
 * Standard successful API response envelope.
 * { success: true, data: T }
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessEnvelope<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard error API response envelope.
 * { success: false, error: { code, message } }
 */
export function apiError(
  code: string,
  message: string,
  status = 400
): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}
