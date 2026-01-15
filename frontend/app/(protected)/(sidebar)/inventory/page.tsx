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

  const handleCreateProduct = async () => {
    try {
      const productResponse = await fetch('/api/backend/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          categoryId: parseInt(productForm.categoryId),
          currentPrice: parseFloat(productForm.currentPrice),
          minPrice: parseFloat(productForm.minPrice),
          maxPrice: parseFloat(productForm.maxPrice),
        }),
      });

      if (!productResponse.ok) {
        const error = await productResponse.json();
        throw new Error(error.message || 'Failed to create product');
      }

      const newProduct = await productResponse.json();

      if (
        productForm.initialQuantity &&
        parseFloat(productForm.initialQuantity) > 0
      ) {
        await fetch('/api/backend/inventory/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            productId: newProduct.id,
            quantity: parseFloat(productForm.initialQuantity),
            notes: productForm.notes || 'Initial stock',
          }),
        });
      }

      await refetchInventory();
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
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  const handleAddStock = async () => {
    if (!selectedProduct) {
      alert('No product selected');
      return;
    }

    try {
      const response = await fetch('/api/backend/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProduct.productId,
          quantity: parseFloat(formData.quantity),
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to add stock');

      await refetchInventory();
      closeModals();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  const handleRemoveStock = async () => {
    if (!selectedProduct) {
      alert('No product selected');
      return;
    }

    try {
      const response = await fetch('/api/backend/inventory/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProduct.productId,
          quantity: parseFloat(formData.quantity),
          referenceId: formData.referenceId,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove stock');
      }

      await refetchInventory();
      closeModals();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct) {
      alert('No product selected');
      return;
    }

    try {
      const response = await fetch('/api/backend/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProduct.productId,
          newQuantity: parseFloat(formData.quantity),
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to adjust stock');

      await refetchInventory();
      closeModals();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  const handleAddCategory = async () => {
    try {
      const categoryResponse = await fetch('/api/backend/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          dynamicPricing: categoryForm.dynamicPricing,
        }),
      });

      if (!categoryResponse.ok) {
        const error = await categoryResponse.json();
        throw new Error(error.message || 'Failed to create category');
      }

      setShowCreateCategoryModal(false);
      setCategoryForm({
        name: '',
        dynamicPricing: true,
      });
      await refetchCategories();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!id) return;
    try {
      const deleteResponse = await fetch(`/api/backend/product/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      setShowDeleteProductModal(false);
      await refetchInventory();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

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
