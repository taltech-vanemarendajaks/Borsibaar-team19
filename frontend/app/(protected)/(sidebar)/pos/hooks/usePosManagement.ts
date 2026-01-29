"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarStation, CurrentUser, User } from "../types";
import { fetchCurrentUser } from "@/lib/api/account";
import { fetchAllUsers } from "@/lib/api/users";
import {
  createStation,
  deleteStation,
  fetchStationsForUser,
  updateStation,
} from "@/lib/api/stations";
import { useApiError } from "@/hooks/use-api-error";

export function usePosManagement() {
  const router = useRouter();
  const { handleFetchError } = useApiError();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [stations, setStations] = useState<BarStation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);

  const refreshStations = useCallback(async (isAdmin: boolean) => {
    const data = await fetchStationsForUser(isAdmin);
    setStations(data);
    return data;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);

        if (!user) {
          return;
        }

        const isAdmin = user.role === "ADMIN";

        const data = await refreshStations(isAdmin);
        setError(null);

        if (!isAdmin && data.length === 1) {
          router.push(`/pos/${data[0].id}`);
          return;
        }

        if (isAdmin) {
          try {
            const users = await fetchAllUsers();
            setAllUsers(users);
            setUserFetchError(null);
          } catch (err) {
            const errData = handleFetchError(
              err instanceof Error ? err : new Error("Failed to fetch users"),
            );
            setAllUsers([]);
            setUserFetchError(errData.error);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, refreshStations, handleFetchError]);

  const handleCreateStation = useCallback(
    async (data: { name: string; description: string; userIds: string[] }) => {
      const payload = {
        name: data.name,
        description: data.description,
        isActive: true,
        userIds: data.userIds,
      };
      try {
        await createStation(payload);
        const admin = currentUser?.role === "ADMIN";
        if (admin) await refreshStations(true);
      } catch (err) {
        handleFetchError(
          err instanceof Error ? err : new Error("Failed to create station"),
        );
      }
    },
    [refreshStations, currentUser, handleFetchError],
  );

  const handleUpdateStation = useCallback(
    async (
      stationId: number,
      data: { name: string; description: string; userIds: string[] },
    ) => {
      const payload = {
        name: data.name,
        description: data.description,
        isActive: true,
        userIds: data.userIds,
      };

      try {
        await updateStation(stationId, payload);
        await refreshStations(true);
      } catch (err) {
        handleFetchError(
          err instanceof Error ? err : new Error("Failed to update station"),
        );
      }
    },
    [refreshStations, handleFetchError],
  );

  const handleDeleteStation = useCallback(
    async (stationId: number) => {
      try {
        await deleteStation(stationId);
        await refreshStations(true);
      } catch (err) {
        handleFetchError(
          err instanceof Error ? err : new Error("Failed to delete station"),
        );
      }
    },
    [refreshStations, handleFetchError],
  );

  const isAdmin = currentUser?.role === "ADMIN";

  return {
    currentUser,
    stations,
    allUsers,
    loading,
    error,
    userFetchError,
    isAdmin,
    handleCreateStation,
    handleUpdateStation,
    handleDeleteStation,
  };
}
