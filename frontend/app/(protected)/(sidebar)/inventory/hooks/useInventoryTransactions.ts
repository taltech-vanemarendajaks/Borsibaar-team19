import { useState, useCallback } from 'react';
import { InventoryTransactionResponseDto } from '../types';

export function useInventoryTransactions() {
  const [transactionHistory, setTransactionHistory] = useState<
    InventoryTransactionResponseDto[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionHistory = useCallback(async (productId: number) => {
    try {
      setLoadingHistory(true);
      setError(null);
      const response = await fetch(
        `/api/backend/inventory/product/${productId}/history`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setTransactionHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching history:', err);
      setTransactionHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setTransactionHistory([]);
    setError(null);
    setLoadingHistory(false);
  }, []);

  return {
    transactionHistory,
    loadingHistory,
    error,
    fetchTransactionHistory,
    clearHistory,
  };
}
