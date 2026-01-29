import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
    try {
        // Get the categoryId parameter from the request URL
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");

        // Build the backend URL with optional categoryId parameter
        const url = new URL(`${backendUrl}/api/inventory`);
        if (categoryId) {
            url.searchParams.append("categoryId", categoryId);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Cookie: request.headers.get("cookie") || "",
            },
            credentials: "include",
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMessage = text;
            try {
                const json = JSON.parse(text);
                errorMessage = json.error || json.message || text;
            } catch {}
            return NextResponse.json(
                { error: errorMessage || "Failed to fetch inventory", status: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch inventory" },
            { status: 500 }
        );
    }
}
