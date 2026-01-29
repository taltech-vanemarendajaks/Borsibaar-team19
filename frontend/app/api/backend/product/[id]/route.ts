import {NextRequest, NextResponse} from "next/server";
import { backendUrl } from "@/utils/constants";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const response = await fetch(`${backendUrl}/api/products/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
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
                { error: errorMessage || "Failed to delete product", status: response.status },
                { status: response.status }
            );
        }

        return NextResponse.json({ status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
