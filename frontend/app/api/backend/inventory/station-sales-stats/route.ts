import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${backendUrl}/api/inventory/station-sales-stats`, {
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
                { error: errorMessage || "Failed to fetch station sales statistics", status: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch station sales statistics" },
            { status: 500 }
        );
    }
}

