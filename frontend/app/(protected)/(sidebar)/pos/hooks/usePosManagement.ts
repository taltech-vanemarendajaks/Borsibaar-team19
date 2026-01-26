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

export function usePosManagement() {
  const router = useRouter();

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
            const message =
              err instanceof Error ? err.message : "Failed to fetch users";
            setAllUsers([]);
            setUserFetchError(message);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, refreshStations]);

  const handleCreateStation = useCallback(
    async (data: { name: string; description: string; userIds: string[] }) => {
      const payload = {
        name: data.name,
        description: data.description,
        isActive: true,
        userIds: data.userIds,
      };

      await createStation(payload);
      const admin = currentUser?.role === "ADMIN";
      if (admin) await refreshStations(true);
    },
    [refreshStations, currentUser],
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

      await updateStation(stationId, payload);
      await refreshStations(true);
    },
    [refreshStations],
  );

  const handleDeleteStation = useCallback(
    async (stationId: number) => {
      await deleteStation(stationId);
      await refreshStations(true);
    },
    [refreshStations],
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
