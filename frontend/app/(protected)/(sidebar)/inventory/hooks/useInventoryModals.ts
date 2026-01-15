/**
 * Custom hook for managing all modal visibility states
 * Provides state and handlers for opening/closing various inventory modals
 * @returns Object containing modal states, setters, and open/close handlers
 */
import { useState } from 'react';
import { InventoryItem } from '../types';

export function useInventoryModals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null
  );

  const openAddModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowAddModal(true);
  };

  const openDeleteModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowDeleteProductModal(true);
  };

  const openRemoveModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowRemoveModal(true);
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowAdjustModal(true);
  };

  const openHistoryModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowHistoryModal(true);
  };

  const closeModals = (clearHistory?: () => void) => {
    setShowAddModal(false);
    setShowRemoveModal(false);
    setShowAdjustModal(false);
    setShowHistoryModal(false);
    setShowCreateCategoryModal(false);
    setShowDeleteProductModal(false);
    setSelectedProduct(null);
    if (clearHistory) {
      clearHistory();
    }
  };

  return {
    // Modal states
    showAddModal,
    showRemoveModal,
    showAdjustModal,
    showHistoryModal,
    showCreateProductModal,
    showDeleteProductModal,
    showCreateCategoryModal,
    selectedProduct,
    // Modal setters
    setShowAddModal,
    setShowRemoveModal,
    setShowAdjustModal,
    setShowHistoryModal,
    setShowCreateProductModal,
    setShowDeleteProductModal,
    setShowCreateCategoryModal,
    setSelectedProduct,
    // Modal openers
    openAddModal,
    openDeleteModal,
    openRemoveModal,
    openAdjustModal,
    openHistoryModal,
    // Modal closer
    closeModals,
  };
}
