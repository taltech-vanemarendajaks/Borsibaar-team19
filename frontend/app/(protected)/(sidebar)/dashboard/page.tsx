"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useApiError } from "@/hooks/use-api-error";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export const dynamic = "force-dynamic"; // still opt-out of caching

interface CurrentUser {
  id: number | string;
  email: string;
  name?: string;
  organizationId?: number;
  needsOnboarding?: boolean;
  role?: string;
}

interface UserSalesStats {
  userId: string;
  userName: string;
  userEmail: string;
  salesCount: number;
  totalRevenue: number;
  barStationId: number | null;
  barStationName: string | null;
}

interface StationSalesStats {
  barStationId: number;
  barStationName: string | null;
  salesCount: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const { handleError, handleFetchError } = useApiError();
  const authFetch = useAuthFetch();
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("-");
  const [salesStats, setSalesStats] = useState<UserSalesStats[]>([]);
  const [stationStats, setStationStats] = useState<StationSalesStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<{
    name: string;
    priceIncreaseStep?: number;
    priceDecreaseStep?: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // replacing with authFetch
      const userRes = await authFetch("/api/backend/account", {
        cache: "no-store",
      });
      if (!userRes.ok) throw new Error(`Failed user fetch: ${userRes.status}`);

      const userJson: CurrentUser = await userRes.json();
      setMe(userJson);

      // Parallel fetches that depend on user
      if (userJson.organizationId) {
        // Fetch organization via Next.js proxy to avoid CORS and forward cookies
        try {
          const orgRes = await authFetch(
            `/api/backend/organizations/${userJson.organizationId}`,
            { cache: "no-store" }
          );
          if (orgRes.ok) {
            const org = await orgRes.json();
            setOrgName(org?.name || "Unknown Organization");
            setOrgDetails({
              name: org?.name || "Unknown Organization",
              priceIncreaseStep: org?.priceIncreaseStep
                ? parseFloat(org.priceIncreaseStep)
                : undefined,
              priceDecreaseStep: org?.priceDecreaseStep
                ? parseFloat(org.priceDecreaseStep)
                : undefined,
            });
          } else {
            await handleError(orgRes, "Failed to fetch organization");
            setOrgName("Unknown Organization");
          }
        } catch (err) {
          handleFetchError(err instanceof Error ? err : new Error("Failed to fetch organization"));
          setOrgName("Unknown Organization");
        }

        try {
          const statsRes = await authFetch(`/api/backend/inventory/sales-stats`, {
            cache: "no-store",
          });
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            if (Array.isArray(statsJson)) setSalesStats(statsJson);
          } else {
            await handleError(statsRes, "Failed to fetch sales statistics");
          }
        } catch (err) {
          handleFetchError(err instanceof Error ? err : new Error("Failed to fetch sales statistics"));
        }

        try {
          const stationStatsRes = await authFetch(
            `/api/backend/inventory/station-sales-stats`,
            { cache: "no-store" }
          );
          if (stationStatsRes.ok) {
            const stationStatsJson = await stationStatsRes.json();
            if (Array.isArray(stationStatsJson)) setStationStats(stationStatsJson);
          } else {
            await handleError(stationStatsRes, "Failed to fetch station sales statistics");
          }
        } catch (err) {
          handleFetchError(err instanceof Error ? err : new Error("Failed to fetch station sales statistics"));
        }
      } else {
        setOrgName("No organization");
      }
    } catch (e: unknown) {
      function hasMessage(x: unknown): x is { message: string } {
        return (
          !!x &&
          typeof x === "object" &&
          "message" in x &&
          typeof (x as { message?: unknown }).message === "string"
        );
      }
      if (hasMessage(e)) setError(e.message);
      else setError("Failed to load dashboard");
      handleFetchError(e instanceof Error ? e : new Error("Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  }, [handleError, handleFetchError, authFetch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleOrgUpdate(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    if (!me?.organizationId || !orgDetails) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const res = await authFetch(
        `/api/backend/organizations/${me.organizationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orgDetails.name,
            priceIncreaseStep: orgDetails.priceIncreaseStep,
            priceDecreaseStep: orgDetails.priceDecreaseStep,
          }),
        }
      );
      if (!res.ok) {
        await handleError(res, "Failed to update organization");
        return;
      }
      const updated = await res.json();
      setOrgDetails({
        name: updated.name,
        priceIncreaseStep: updated.priceIncreaseStep
          ? parseFloat(updated.priceIncreaseStep)
          : undefined,
        priceDecreaseStep: updated.priceDecreaseStep
          ? parseFloat(updated.priceDecreaseStep)
          : undefined,
      });
      setSaveSuccess("Organization updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update organization";
      setSaveError(message);
      handleFetchError(err instanceof Error ? err : new Error(message));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return <p className="p-4">Not authenticated.</p>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="rounded-lg bg-card p-6 shadow border-1 border-[color-mix(in oklab, var(--ring) 50%, transparent)]">
        {error && (
          <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <h1 className="text-3xl font-bold text-card-foreground mb-4">
          Welcome, {me.name || me.email}!
        </h1>
        <div className="space-y-2 text-muted-foreground mb-6">
          <p>
            <span className="font-medium text-card-foreground">Email:</span>{" "}
            {me.email}
          </p>
          <p>
            <span className="font-medium text-card-foreground">
              Organization:
            </span>{" "}
            {orgName}
          </p>
          <p>
            <span className="font-medium text-card-foreground">Role:</span>{" "}
            {me.role || "No role assigned"}
          </p>
        </div>

        {stationStats.length > 0 && (
          <div className="rounded-lg bg-card p-6 shadow mb-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Station Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Station
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Sales Count
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stationStats.map((stat) => (
                    <tr
                      key={stat.barStationId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3">
                        <div className="font-medium text-card-foreground">
                          {stat.barStationName || `Station ${stat.barStationId}`}
                        </div>
                      </td>
                      <td className="py-3 text-card-foreground font-medium">
                        {stat.salesCount}
                      </td>
                      <td className="py-3 text-card-foreground font-medium">
                        €{stat.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {salesStats.length > 0 && (
          <div className="rounded-lg bg-card p-6 shadow">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Sales Performance by User
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      User
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Station
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Sales Count
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesStats.map((stat, index) => (
                    <tr
                      key={`${stat.userId}-${stat.barStationId || "null"
                        }-${index}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-card-foreground">
                            {stat.userName || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-card-foreground">
                        {stat.barStationName ||
                          (stat.barStationId
                            ? `Station ${stat.barStationId}`
                            : "N/A")}
                      </td>
                      <td className="py-3 text-card-foreground font-medium">
                        {stat.salesCount}
                      </td>
                      <td className="py-3 text-card-foreground font-medium">
                        €{stat.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {me.role === "ADMIN" && orgDetails && (
          <div>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Organization Settings
            </h2>
            <form onSubmit={handleOrgUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-card-foreground">
                  Name
                </label>
                <Input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={orgDetails.name}
                  onChange={(e) =>
                    setOrgDetails((d) =>
                      d ? { ...d, name: e.target.value } : d
                    )
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-card-foreground">
                    Price Increase Step (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={orgDetails.priceIncreaseStep ?? ""}
                    onChange={(e) =>
                      setOrgDetails((d) =>
                        d
                          ? {
                            ...d,
                            priceIncreaseStep:
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value),
                          }
                          : d
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-card-foreground">
                    Price Decrease Step (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={orgDetails.priceDecreaseStep ?? ""}
                    onChange={(e) =>
                      setOrgDetails((d) =>
                        d
                          ? {
                            ...d,
                            priceDecreaseStep:
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value),
                          }
                          : d
                      )
                    }
                  />
                </div>
              </div>
              {saveError && (
                <p className="text-sm text-destructive">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="text-sm text-green-600">{saveSuccess}</p>
              )}
              <button
                type="submit"
                className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
