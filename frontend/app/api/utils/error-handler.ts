import { NextRequest, NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  status?: number;
}

export function handleApiError(
  error: unknown,
  defaultMessage: string
): NextResponse<ApiErrorResponse> {
  console.error("API Error:", error);

  let errorMessage = defaultMessage;
  let errorDetails = null;
  let statusCode = 500;

  if (error && typeof error === "object" && "status" in error){
    statusCode=(error as any).status
  }


  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (typeof error === "object" && error !== null) {
    errorDetails = error;
  }

  return NextResponse.json(
    {
      error: errorMessage,
      details: errorDetails,
      status: statusCode,
    },
    { status: statusCode }
  );
}

export function handleResponseError(
  status: number,
  responseText: string,
  defaultMessage: string
): NextResponse<ApiErrorResponse> {
  let errorMessage = responseText || defaultMessage;
  let details = undefined;

  // Try to parse if it's JSON
  try {
    const parsed = JSON.parse(responseText);
    errorMessage = parsed.error || parsed.message || defaultMessage;
    details = parsed.details || parsed.trace;
  } catch {
    // Not JSON, use as-is
  }

  return NextResponse.json(
    {
      error: errorMessage,
      details: details,
      status,
    },
    { status }
  );
}
