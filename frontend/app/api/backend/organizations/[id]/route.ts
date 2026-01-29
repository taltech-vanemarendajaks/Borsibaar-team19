import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

// Proxy endpoint for a single organization resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetch(
      `${backendUrl}/api/organizations/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    // Pass through non-OK responses as-is (text or json)
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = text;
      try {
        const json = JSON.parse(text);
        errorMessage = json.error || json.message || text;
      } catch {}
      return NextResponse.json(
        { error: errorMessage || "Failed to fetch organization", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error (organization by id):", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    console.log(`${backendUrl}/api/organizations/${encodeURIComponent(id)}`)
      console.log("PUT body:", body);
    const response = await fetch(
        `${backendUrl}/api/organizations/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              Cookie: request.headers.get("cookie") || "",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify(body),
        }
    );
  console.log("PUT response:", response);
    // Pass through non-OK responses as-is (text or json)
      if (!response.ok) {
          const text = await response.text();
          let errorMessage = text;
          try {
              const json = JSON.parse(text);
              errorMessage = json.error || json.message || text;
          } catch {}
          return NextResponse.json(
              { error: errorMessage || "Failed to update organization", status: response.status },
              { status: response.status }
          );
      }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
        { error: "Failed to update organization" },
        { status: 500 }
    );
  }
}

