import { User } from "@/app/(protected)/(sidebar)/pos/types";

export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch("/api/backend/users", { cache: "no-store" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch users");
  }

  return response.json();
}
