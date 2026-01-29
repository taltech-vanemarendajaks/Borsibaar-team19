import { Category } from "@/app/(protected)/(sidebar)/pos/[stationId]/types";

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/backend/categories", {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}
