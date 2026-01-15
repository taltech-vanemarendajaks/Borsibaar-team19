/**
 * Main custom hook that combines all inventory-related hooks
 * This is the primary hook used by the Inventory page component
 * Orchestrates data fetching, state management, and action handlers
 * @returns Comprehensive object containing all inventory page state and handlers
 */
import { useCategories } from './useCategories';
import { useInventory } from './useInventory';
import { useInventoryActions } from './useInventoryActions';
import { useInventoryForms } from './useInventoryForms';
import { useInventoryModalHandlers } from './useInventoryModalHandlers';
import { useInventoryModals } from './useInventoryModals';
import { useInventorySearch } from './useInventorySearch';
import { useInventoryTransactions } from './useInventoryTransactions';

export function useInventoryPage() {
  const {
    inventory,
    loading,
    error,
    refetch: refetchInventory,
  } = useInventory();
  const { categories, refetch: refetchCategories } = useCategories();
  const { searchTerm, setSearchTerm, filteredInventory } =
    useInventorySearch(inventory);
  const {
    showAddModal,
    showRemoveModal,
    showAdjustModal,
    showHistoryModal,
    showCreateProductModal,
    showDeleteProductModal,
    showCreateCategoryModal,
    selectedProduct,
    setShowAddModal,
    setShowRemoveModal,
    setShowAdjustModal,
    setShowHistoryModal,
    setShowCreateProductModal,
    setShowDeleteProductModal,
    setShowCreateCategoryModal,
    setSelectedProduct,
    openAddModal,
    openDeleteModal,
    openRemoveModal,
    openAdjustModal,
    openHistoryModal,
    closeModals,
  } = useInventoryModals();
  const {
    transactionHistory,
    loadingHistory,
    fetchTransactionHistory,
    clearHistory,
  } = useInventoryTransactions();
  const {
    formData,
    categoryForm,
    productForm,
    setFormData,
    setCategoryForm,
    setProductForm,
    resetFormData,
    resetCategoryForm,
    resetProductForm,
  } = useInventoryForms();

  const {
    handleCreateProduct,
    handleAddStock,
    handleRemoveStock,
    handleAdjustStock,
    handleAddCategory,
    handleDeleteProduct,
  } = useInventoryActions({
    refetchInventory,
    refetchCategories,
    selectedProduct,
    formData,
    productForm,
    categoryForm,
    onCloseModals: () => {
      closeModals(clearHistory);
      resetFormData();
    },
    onProductFormReset: () => {
      setShowCreateProductModal(false);
      resetProductForm();
    },
    onCategoryFormReset: () => {
      setShowCreateCategoryModal(false);
      resetCategoryForm();
    },
    onDeleteModalClose: () => {
      setShowDeleteProductModal(false);
    },
  });

  const { handleOpenAdjustModal, handleOpenHistoryModal } =
    useInventoryModalHandlers({
      openAdjustModal,
      openHistoryModal,
      setFormData,
      formData,
      fetchTransactionHistory,
    });

  return {
    // Data
    inventory,
    filteredInventory,
    categories,
    transactionHistory,
    // Loading & Error
    loading,
    loadingHistory,
    error,
    // Search
    searchTerm,
    setSearchTerm,
    // Modals
    showAddModal,
    showRemoveModal,
    showAdjustModal,
    showHistoryModal,
    showCreateProductModal,
    showDeleteProductModal,
    showCreateCategoryModal,
    selectedProduct,
    setShowAddModal,
    setShowRemoveModal,
    setShowAdjustModal,
    setShowHistoryModal,
    setShowCreateProductModal,
    setShowDeleteProductModal,
    setShowCreateCategoryModal,
    setSelectedProduct,
    // Forms
    formData,
    categoryForm,
    productForm,
    setFormData,
    setCategoryForm,
    setProductForm,
    // Handlers
    openAddModal,
    openRemoveModal,
    handleOpenAdjustModal,
    handleOpenHistoryModal,
    openDeleteModal,
    handleCreateProduct,
    handleAddStock,
    handleRemoveStock,
    handleAdjustStock,
    handleAddCategory,
    handleDeleteProduct,
  };
}
