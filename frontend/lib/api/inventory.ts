import { Product } from "@/app/(protected)/(sidebar)/pos/[stationId]/types";

export async function fetchProducts(
  selectedCategory: number | null,
): Promise<Product[]> {
  const url = selectedCategory
    ? `/api/backend/inventory?categoryId=${selectedCategory}`
    : "/api/backend/inventory";

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch products");

  return response.json();
}
