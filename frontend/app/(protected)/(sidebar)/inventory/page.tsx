'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ListPlus, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import { AddStockDialog } from './components/AddStockDialog';
import { AdjustStockDialog } from './components/AdjustStockDialog';
import { CreateProductDialog } from './components/CreateProductDialog';
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
    return (
      <div className="min-h-screen w-full bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="rounded-lg bg-card p-6 shadow-sm border-1 border-[color-mix(in oklab, var(--ring) 50%, transparent)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-100">
              Inventory Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowCreateCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-black rounded-lg hover:bg-blue-200 transition font-medium"
            >
              <ListPlus className="w-4 h-4" />
              <span className="flex">New Category</span>
            </Button>
            <Button
              onClick={() => setShowCreateProductModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="flex">New Product</span>
            </Button>
            <div className="text-sm text-gray-400">
              Total Items: {inventory.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-950 border border-red-800 rounded-lg flex items-center gap-2 text-red-50">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

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

      <Dialog
        open={showDeleteProductModal}
        onOpenChange={setShowDeleteProductModal}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              This action will permanently delete the product and its related
              data. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-sm text-gray-300">
              Product:{' '}
              <span className="font-semibold">
                {selectedProduct?.productName}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              ID:{' '}
              <span className="font-mono">
                {selectedProduct?.productId ?? selectedProduct?.id}
              </span>
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteProductModal(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (selectedProduct) {
                  handleDeleteProduct(selectedProduct.productId);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCreateCategoryModal}
        onOpenChange={setShowCreateCategoryModal}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category Name *
              </label>
              <Input
                type="text"
                value={categoryForm.name}
                onChange={e =>
                  setCategoryForm({
                    ...categoryForm,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Dynamic Pricing *
              </label>
              <Select
                value={categoryForm.dynamicPricing ? 'enabled' : 'disabled'}
                onValueChange={value =>
                  setCategoryForm({
                    ...categoryForm,
                    dynamicPricing: value === 'enabled',
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddCategory}
              disabled={!categoryForm.name}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              Create Category
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>

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
