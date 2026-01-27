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

export async function fetchStation(stationId: string): Promise<BarStation> {
  const response = await fetch(`/api/backend/bar-stations/${stationId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      throw new Error("You don't have access to this station");
    }
    throw new Error("Failed to fetch station");
  }

  return response.json();
}

export async function createStation(payload: {
  name: string;
  description: string;
  isActive: boolean;
  userIds: string[];
}): Promise<void> {
  const response = await fetch("/api/backend/bar-stations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create station");
  }
}

export async function updateStation(
  stationId: number,
  data: {
    name: string;
    description: string;
    userIds: string[];
  },
): Promise<void> {
  const payload = {
    name: data.name,
    description: data.description,
    isActive: true,
    userIds: data.userIds,
  };

  const response = await fetch(`/api/backend/bar-stations/${stationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update station");
  }
}

export async function deleteStation(stationId: number): Promise<void> {
  const response = await fetch(`/api/backend/bar-stations/${stationId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete station");
  }
}
