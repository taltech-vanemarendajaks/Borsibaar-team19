import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${backendUrl}/api/inventory/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: request.headers.get("cookie") || "",
            },
            credentials: "include",
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMessage = text;
            try {
                const json = JSON.parse(text);
                errorMessage = json.error || json.message || text;
            } catch {}
            return NextResponse.json(
                { error: errorMessage || "Failed to remove stock", status: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to remove stock", status: 500 },
            { status: 500 }
        );
    }
}
