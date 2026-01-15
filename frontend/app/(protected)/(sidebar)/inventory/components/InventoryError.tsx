'use client';

import { AlertCircle } from 'lucide-react';

interface InventoryErrorProps {
  error: string;
}

export function InventoryError({ error }: InventoryErrorProps) {
  return (
    <div className="mb-4 p-4 bg-red-950 border border-red-800 rounded-lg flex items-center gap-2 text-red-50">
      <AlertCircle className="w-5 h-5" />
      <span>{error}</span>
    </div>
  );
}
