"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Store } from "lucide-react";
import { useApiError } from "@/hooks/use-api-error";
import { StationManagementHeader } from "./StationManagementHeader";
import { StationCard } from "./StationCard";
import { CurrentUser, BarStation, User } from "./types";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export const dynamic = "force-dynamic";

export default function POSManagement() {
  const router = useRouter();
  const { handleError, handleFetchError } = useApiError();
  const authFetch = useAuthFetch();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [stations, setStations] = useState<BarStation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStationId, setEditingStationId] = useState<number | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authFetch("/api/backend/account");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        return data;
      } else {
        await handleError(response, "Failed to fetch user account");
      }
    } catch (err) {
      handleFetchError(err instanceof Error ? err : new Error("Failed to fetch current user"));
    }
    return null;
  }, [authFetch, handleError, handleFetchError]);

  const fetchStations = useCallback(
    async (isAdmin: boolean) => {
      try {
        const url = isAdmin
          ? "/api/backend/bar-stations"
          : "/api/backend/bar-stations/user";

        const response = await authFetch(url, { cache: "no-store" });

        if (!response.ok) {
          await handleError(response, "Failed to fetch stations");
          setError("Failed to fetch stations");
          return;
        }

        const data = await response.json();
        setStations(data);

        // If non-admin with single station, auto-redirect
        if (!isAdmin && data.length === 1) {
          router.push(`/pos/${data[0].id}`);
          return;
        }

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        handleFetchError(err instanceof Error ? err : new Error(message));
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [router, handleError, handleFetchError, authFetch]
  );

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await authFetch("/api/backend/users", { cache: "no-store" });
      if (!response.ok) {
        await handleError(response, "Failed to fetch users");
        setAllUsers([]);
        return;
      }

      const data = await response.json();
      setAllUsers(data);
      setUserFetchError(null);
    } catch (err) {
      handleFetchError(err instanceof Error ? err : new Error("Failed to fetch users"));
      setAllUsers([]);
    }
  }, [handleError, handleFetchError, authFetch]);

  useEffect(() => {
    const init = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        const isAdmin = user.role === "ADMIN";
        await fetchStations(isAdmin);

        if (isAdmin) {
          await fetchAllUsers();
        }
      }
    };

    init();
  }, [fetchStations, fetchAllUsers, fetchCurrentUser]);

  const handleCreateStation = async (data: {
    name: string;
    description: string;
    userIds: string[];
  }) => {
    const payload = {
      name: data.name,
      description: data.description,
      isActive: true,
      userIds: data.userIds,
    };

    try {
      const response = await authFetch("/api/backend/bar-stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await handleError(response, "Failed to create station");
        return;
      }

      await fetchStations(true);
    } catch (err) {
      handleFetchError(err instanceof Error ? err : new Error("Failed to create station"));
    }
  };

  const handleUpdateStation = async (
    stationId: number,
    data: {
      name: string;
      description: string;
      userIds: string[];
    }
  ) => {
    const payload = {
      name: data.name,
      description: data.description,
      isActive: true,
      userIds: data.userIds,
    };

    try {
      const response = await authFetch(`/api/backend/bar-stations/${stationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await handleError(response, "Failed to update station");
        return;
      }

      await fetchStations(true);
    } catch (err) {
      handleFetchError(err instanceof Error ? err : new Error("Failed to update station"));
    }
  };

  const handleDeleteStation = async (stationId: number) => {
    if (!confirm("Are you sure you want to delete this station?")) {
      return;
    }

    try {
      const response = await authFetch(`/api/backend/bar-stations/${stationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        await handleError(response, "Failed to delete station");
        return;
      }

      await fetchStations(true);
    } catch (err) {
      handleFetchError(err instanceof Error ? err : new Error("Failed to delete station"));
    }
  };

  const handleEditClick = (station: BarStation) => {
    setEditingStationId(station.id);
  };

  const handleEditClose = () => {
    setEditingStationId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-gray-100 mb-2">{error}</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "ADMIN";

  // Non-admin with no stations
  if (!isAdmin && stations.length === 0) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-100 mb-2">
            You have not been assigned to any station
          </p>
          <p className="text-sm text-gray-400">
            Please contact your administrator to get access to a POS station.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 w-full">
      <StationManagementHeader
        isAdmin={isAdmin}
        isCreateDialogOpen={isCreateDialogOpen}
        onCreateDialogOpenChange={setIsCreateDialogOpen}
        allUsers={allUsers}
        userFetchError={userFetchError}
        onCreate={handleCreateStation}
      />

      {/* Stations Grid - Single column on tablets, multi-column on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            isAdmin={isAdmin}
            allUsers={allUsers}
            userFetchError={userFetchError}
            editingStationId={editingStationId}
            onEditClick={handleEditClick}
            onEditClose={handleEditClose}
            onUpdate={(data) => handleUpdateStation(station.id, data)}
            onDelete={handleDeleteStation}
          />
        ))}
      </div>

      {stations.length === 0 && isAdmin && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-100 mb-2">No stations yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Create your first POS station to get started
          </p>
        </div>
      )}
    </div>
  );
}
