import { useState, useMemo } from 'react';
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
