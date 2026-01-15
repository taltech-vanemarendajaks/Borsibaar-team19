/**
 * Custom hook for handling modal opening with additional logic
 * Combines modal opening with form data initialization and transaction history fetching
 * @param props - Configuration object containing modal openers, form setters, and fetch functions
 * @returns Object containing handleOpenAdjustModal and handleOpenHistoryModal functions
 */
import { InventoryItem } from '../types';

interface UseInventoryModalHandlersProps {
  openAdjustModal: (item: InventoryItem) => void;
  openHistoryModal: (item: InventoryItem) => void;
  setFormData: (data: {
    quantity: string;
    notes: string;
    referenceId: string;
  }) => void;
  formData: {
    quantity: string;
    notes: string;
    referenceId: string;
  };
  fetchTransactionHistory: (productId: number) => Promise<void>;
}

export function useInventoryModalHandlers({
  openAdjustModal,
  openHistoryModal,
  setFormData,
  formData,
  fetchTransactionHistory,
}: UseInventoryModalHandlersProps) {
  const handleOpenAdjustModal = (item: InventoryItem) => {
    setFormData({ ...formData, quantity: item.quantity.toString() });
    openAdjustModal(item);
  };

  const handleOpenHistoryModal = async (item: InventoryItem) => {
    openHistoryModal(item);
    await fetchTransactionHistory(item.productId);
  };

  return {
    handleOpenAdjustModal,
    handleOpenHistoryModal,
  };
}
