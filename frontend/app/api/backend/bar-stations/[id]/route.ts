import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetch(
      `${backendUrl}/api/bar-stations/${id}`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const json = JSON.parse(errorText);
        errorMessage = json.error || json.message || errorText;
      } catch {}
      return NextResponse.json(
        { error: errorMessage || "Failed to fetch bar station", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bar station:", error);
    return NextResponse.json(
      { error: "Failed to fetch bar station" },
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

    const response = await fetch(
      `${backendUrl}/api/bar-stations/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const json = JSON.parse(errorText);
        errorMessage = json.error || json.message || errorText;
      } catch {}
      return NextResponse.json(
        { error: errorMessage || "Failed to update bar station", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating bar station:", error);
    return NextResponse.json(
      { error: "Failed to update bar station" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetch(
      `${backendUrl}/api/bar-stations/${id}`,
      {
        method: "DELETE",
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const json = JSON.parse(errorText);
        errorMessage = json.error || json.message || errorText;
      } catch {}
      return NextResponse.json(
        { error: errorMessage || "Failed to delete bar station", status: response.status },
        { status: response.status }
      );
    }

    // Backend returns 204 No Content, return the same
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting bar station:", error);
    return NextResponse.json(
      { error: "Failed to delete bar station" },
      { status: 500 }
    );
  }
}
