'use client';

/**
 * InventoryContent Component
 *
 * Main content container for the inventory page.
 * Renders the header, search bar, error messages, and inventory table.
 * All user interactions are handled via callback props.
 */
import { InventoryItem } from '../types';
import { InventoryError } from './InventoryError';
import { InventoryHeader } from './InventoryHeader';
import { InventorySearch } from './InventorySearch';
import { InventoryTable } from './InventoryTable';

interface InventoryContentProps {
  inventory: InventoryItem[];
  filteredInventory: InventoryItem[];
  searchTerm: string;
  error: string | null;
  onSearchChange: (value: string) => void;
  onAddStock: (item: InventoryItem) => void;
  onRemoveStock: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
  onDeleteProduct: (item: InventoryItem) => void;
  onCreateCategory: () => void;
  onCreateProduct: () => void;
}

export function InventoryContent({
  inventory,
  filteredInventory,
  searchTerm,
  error,
  onSearchChange,
  onAddStock,
  onRemoveStock,
  onAdjustStock,
  onViewHistory,
  onDeleteProduct,
  onCreateCategory,
  onCreateProduct,
}: InventoryContentProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="rounded-lg bg-card p-6 shadow-sm border-1 border-[color-mix(in oklab, var(--ring) 50%, transparent)]">
        <InventoryHeader
          totalItems={inventory.length}
          onCreateCategory={onCreateCategory}
          onCreateProduct={onCreateProduct}
        />

        {error && <InventoryError error={error} />}

        <InventorySearch
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />

        <InventoryTable
          items={filteredInventory}
          onAddStock={onAddStock}
          onRemoveStock={onRemoveStock}
          onAdjustStock={onAdjustStock}
          onViewHistory={onViewHistory}
          onDeleteProduct={onDeleteProduct}
        />
      </div>
    </div>
  );
}
