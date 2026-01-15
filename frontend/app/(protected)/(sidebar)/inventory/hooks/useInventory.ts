/**
 * Custom hook for fetching and managing inventory data
 * Automatically fetches inventory on mount and provides refetch capability
 * @returns Object containing inventory items, loading state, error state, and refetch function
 */
import { useCallback, useEffect, useState } from 'react';
import { InventoryResponseDto } from '../dto';
import { InventoryItem } from '../types';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backend/inventory', {
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data: InventoryResponseDto[] = await response.json();
      setInventory(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    refetch: fetchInventory,
  };
}
