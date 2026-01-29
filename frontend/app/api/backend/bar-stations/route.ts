import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${backendUrl}/api/bar-stations`, {
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
        { error: errorMessage || "Failed to fetch bar stations", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bar stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch bar stations", status: 500 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${backendUrl}/api/bar-stations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
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
        { error: errorMessage || "Failed to create bar station", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating bar station:", error);
    return NextResponse.json(
      { error: "Failed to create bar station", status: 500 },
      { status: 500 }
    );
  }
}

