export async function processSale(saleRequest: {
  items: { productId: number; quantity: number }[];
  notes: string;
  barStationId: number;
}): Promise<void> {
  const response = await fetch("/api/backend/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to process sale");
  }
}
