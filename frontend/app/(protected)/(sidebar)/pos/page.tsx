"use client";

import { useState } from "react";
import { AlertCircle, Store } from "lucide-react";
import { StationManagementHeader } from "./StationManagementHeader";
import { StationCard } from "./StationCard";
import { BarStation } from "./types";
import { usePosManagement } from "./hooks/usePosManagement";

export const dynamic = "force-dynamic";

export default function POSManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStationId, setEditingStationId] = useState<number | null>(null);

  const {
    stations,
    allUsers,
    loading,
    error,
    userFetchError,
    isAdmin,
    handleCreateStation,
    handleUpdateStation,
    handleDeleteStation,
  } = usePosManagement();

  const onDeleteStation = async (stationId: number) => {
    if (!confirm("Are you sure you want to delete this station?")) {
      return;
    }

    try {
      await handleDeleteStation(stationId);
    } catch (err) {
      alert(
        `Error deleting station: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
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
            onDelete={onDeleteStation}
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
