'use client';

import { useState } from 'react';
import { AddStockDialog } from './components/AddStockDialog';
import { AdjustStockDialog } from './components/AdjustStockDialog';
import { CreateCategoryDialog } from './components/CreateCategoryDialog';
import { CreateProductDialog } from './components/CreateProductDialog';
import { DeleteProductDialog } from './components/DeleteProductDialog';
import { InventoryError } from './components/InventoryError';
import { InventoryHeader } from './components/InventoryHeader';
import { InventoryLoading } from './components/InventoryLoading';
import { InventorySearch } from './components/InventorySearch';
import { InventoryTable } from './components/InventoryTable';
import { RemoveStockDialog } from './components/RemoveStockDialog';
import { TransactionHistoryDialog } from './components/TransactionHistoryDialog';
import { useCategories } from './hooks/useCategories';
import { useInventory } from './hooks/useInventory';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useInventoryTransactions } from './hooks/useInventoryTransactions';
import { InventoryItem } from './types';
import { filterInventory } from './utils';

export const dynamic = 'force-dynamic';

export default function Inventory() {
  const {
    inventory,
    loading,
    error,
    refetch: refetchInventory,
  } = useInventory();
  const { categories, refetch: refetchCategories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null
  );
  const {
    transactionHistory,
    loadingHistory,
    fetchTransactionHistory,
    clearHistory,
  } = useInventoryTransactions();
  const [formData, setFormData] = useState({
    quantity: '',
    notes: '',
    referenceId: '',
  });
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    dynamicPricing: true,
  });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    currentPrice: '',
    minPrice: '',
    maxPrice: '',
    initialQuantity: '',
    notes: '',
  });

  const closeModals = () => {
    setShowAddModal(false);
    setShowRemoveModal(false);
    setShowAdjustModal(false);
    setShowHistoryModal(false);
    setShowCreateCategoryModal(false);
    setShowDeleteProductModal(false);
    setSelectedProduct(null);
    setFormData({ quantity: '', notes: '', referenceId: '' });
    clearHistory();
  };

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
    onCloseModals: closeModals,
    onProductFormReset: () => {
      setShowCreateProductModal(false);
      setProductForm({
        name: '',
        description: '',
        categoryId: '',
        currentPrice: '',
        minPrice: '',
        maxPrice: '',
        initialQuantity: '',
        notes: '',
      });
    },
    onCategoryFormReset: () => {
      setShowCreateCategoryModal(false);
      setCategoryForm({
        name: '',
        dynamicPricing: true,
      });
    },
    onDeleteModalClose: () => {
      setShowDeleteProductModal(false);
    },
  });

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
    setFormData({ ...formData, quantity: item.quantity.toString() });
    setShowAdjustModal(true);
  };

  const openHistoryModal = async (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowHistoryModal(true);
    await fetchTransactionHistory(item.productId);
  };

  const filteredInventory = filterInventory(inventory, searchTerm);

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
          onAdjustStock={openAdjustModal}
          onViewHistory={openHistoryModal}
          onDeleteProduct={openDeleteModal}
        />
      </div>

      <CreateProductDialog
        open={showCreateProductModal}
        onOpenChange={setShowCreateProductModal}
        productForm={productForm}
        categories={categories}
        onFormChange={(field: keyof typeof productForm, value: string) =>
          setProductForm({ ...productForm, [field]: value })
        }
        onConfirm={handleCreateProduct}
      />

      <DeleteProductDialog
        open={showDeleteProductModal}
        onOpenChange={setShowDeleteProductModal}
        product={selectedProduct}
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          setShowDeleteProductModal(false);
          setSelectedProduct(null);
        }}
      />

      <CreateCategoryDialog
        open={showCreateCategoryModal}
        onOpenChange={setShowCreateCategoryModal}
        categoryForm={categoryForm}
        onFormChange={(field, value) =>
          setCategoryForm({ ...categoryForm, [field]: value })
        }
        onConfirm={handleAddCategory}
      />

      <AddStockDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        product={selectedProduct}
        quantity={formData.quantity}
        notes={formData.notes}
        onQuantityChange={value =>
          setFormData({ ...formData, quantity: value })
        }
        onNotesChange={value => setFormData({ ...formData, notes: value })}
        onConfirm={handleAddStock}
      />

      <RemoveStockDialog
        open={showRemoveModal}
        onOpenChange={setShowRemoveModal}
        product={selectedProduct}
        quantity={formData.quantity}
        referenceId={formData.referenceId}
        notes={formData.notes}
        onQuantityChange={value =>
          setFormData({ ...formData, quantity: value })
        }
        onReferenceIdChange={value =>
          setFormData({ ...formData, referenceId: value })
        }
        onNotesChange={value => setFormData({ ...formData, notes: value })}
        onConfirm={handleRemoveStock}
      />

      <AdjustStockDialog
        open={showAdjustModal}
        onOpenChange={setShowAdjustModal}
        product={selectedProduct}
        quantity={formData.quantity}
        notes={formData.notes}
        onQuantityChange={value =>
          setFormData({ ...formData, quantity: value })
        }
        onNotesChange={value => setFormData({ ...formData, notes: value })}
        onConfirm={handleAdjustStock}
      />

      <TransactionHistoryDialog
        open={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        product={selectedProduct}
        transactions={transactionHistory}
        loading={loadingHistory}
      />
    </div>
  );
}
