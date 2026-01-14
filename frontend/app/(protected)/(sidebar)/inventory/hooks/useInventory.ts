import { useState, useEffect, useCallback } from 'react';
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

      const data = await response.json();
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
