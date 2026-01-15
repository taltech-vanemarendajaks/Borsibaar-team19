'use client';

import { InventoryDialogs } from './components/InventoryDialogs';
import { InventoryError } from './components/InventoryError';
import { InventoryHeader } from './components/InventoryHeader';
import { InventoryLoading } from './components/InventoryLoading';
import { InventorySearch } from './components/InventorySearch';
import { InventoryTable } from './components/InventoryTable';
import { useCategories } from './hooks/useCategories';
import { useInventory } from './hooks/useInventory';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useInventoryForms } from './hooks/useInventoryForms';
import { useInventoryModalHandlers } from './hooks/useInventoryModalHandlers';
import { useInventoryModals } from './hooks/useInventoryModals';
import { useInventorySearch } from './hooks/useInventorySearch';
import { useInventoryTransactions } from './hooks/useInventoryTransactions';

export const dynamic = 'force-dynamic';

export default function Inventory() {
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

  if (loading) {
    return <InventoryLoading />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="rounded-lg bg-card p-6 shadow-sm border-1 border-[color-mix(in oklab, var(--ring) 50%, transparent)]">
        <InventoryHeader
          totalItems={inventory.length}
          onCreateCategory={() => setShowCreateCategoryModal(true)}
          onCreateProduct={() => setShowCreateProductModal(true)}
        />

        {error && <InventoryError error={error} />}

        <InventorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <InventoryTable
          items={filteredInventory}
          onAddStock={openAddModal}
          onRemoveStock={openRemoveModal}
          onAdjustStock={handleOpenAdjustModal}
          onViewHistory={handleOpenHistoryModal}
          onDeleteProduct={openDeleteModal}
        />
      </div>

      <InventoryDialogs
        showAddModal={showAddModal}
        showRemoveModal={showRemoveModal}
        showAdjustModal={showAdjustModal}
        showHistoryModal={showHistoryModal}
        showCreateProductModal={showCreateProductModal}
        showDeleteProductModal={showDeleteProductModal}
        showCreateCategoryModal={showCreateCategoryModal}
        selectedProduct={selectedProduct}
        setShowAddModal={setShowAddModal}
        setShowRemoveModal={setShowRemoveModal}
        setShowAdjustModal={setShowAdjustModal}
        setShowHistoryModal={setShowHistoryModal}
        setShowCreateProductModal={setShowCreateProductModal}
        setShowDeleteProductModal={setShowDeleteProductModal}
        setShowCreateCategoryModal={setShowCreateCategoryModal}
        setSelectedProduct={setSelectedProduct}
        formData={formData}
        categoryForm={categoryForm}
        productForm={productForm}
        setFormData={setFormData}
        setCategoryForm={setCategoryForm}
        setProductForm={setProductForm}
        categories={categories}
        transactionHistory={transactionHistory}
        loadingHistory={loadingHistory}
        handleCreateProduct={handleCreateProduct}
        handleAddStock={handleAddStock}
        handleRemoveStock={handleRemoveStock}
        handleAdjustStock={handleAdjustStock}
        handleAddCategory={handleAddCategory}
        handleDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}
