'use client';

export function InventoryLoading() {
  return (
    <div className="min-h-screen w-full bg-background p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    </div>
  );
}
