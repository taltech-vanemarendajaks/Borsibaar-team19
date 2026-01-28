import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${backendUrl}/api/bar-stations/user`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const json = JSON.parse(errorText);
        errorMessage = json.error || json.message || errorText;
      } catch {}
      return NextResponse.json(
        { error: errorMessage || "Failed to fetch user bar stations", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user bar stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bar stations" },
      { status: 500 }
    );
  }
}

