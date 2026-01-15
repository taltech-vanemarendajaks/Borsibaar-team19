/**
 * Custom hook for managing inventory search functionality
 * Provides search term state and filtered inventory results
 * Uses useMemo to optimize filtering performance
 * @param inventory - Array of inventory items to search through
 * @returns Object containing searchTerm, setSearchTerm, and filteredInventory
 */
import { useMemo, useState } from 'react';
import { InventoryItem } from '../types';
import { filterInventory } from '../utils';

export function useInventorySearch(inventory: InventoryItem[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = useMemo(
    () => filterInventory(inventory, searchTerm),
    [inventory, searchTerm]
  );

  return {
    searchTerm,
    setSearchTerm,
    filteredInventory,
  };
}
