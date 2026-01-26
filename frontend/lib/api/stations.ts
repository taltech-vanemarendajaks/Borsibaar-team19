import { BarStation } from "@/app/(protected)/(sidebar)/pos/types";

export async function fetchStationsForUser(
  isAdmin: boolean,
): Promise<BarStation[]> {
  const url = isAdmin
    ? "/api/backend/bar-stations"
    : "/api/backend/bar-stations/user";

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch stations");
  }

  return response.json();
}
