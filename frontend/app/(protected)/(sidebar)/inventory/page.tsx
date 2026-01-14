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
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ListPlus, Package, Plus, User } from 'lucide-react';
import { useState } from 'react';
import { AddStockDialog } from './components/AddStockDialog';
import { InventorySearch } from './components/InventorySearch';
import { InventoryTable } from './components/InventoryTable';
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

      <Dialog
        open={showCreateProductModal}
        onOpenChange={setShowCreateProductModal}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Product Name *
              </label>
              <Input
                type="text"
                value={productForm.name}
                onChange={e =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category *
              </label>
              <Select
                value={productForm.categoryId}
                onValueChange={value =>
                  setProductForm({ ...productForm, categoryId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productForm.currentPrice}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    currentPrice: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Min price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productForm.minPrice}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    minPrice: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productForm.maxPrice}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    maxPrice: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                value={productForm.description}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Product description (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Initial Quantity
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productForm.initialQuantity}
                onChange={e =>
                  setProductForm({
                    ...productForm,
                    initialQuantity: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty or 0 for no initial stock
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <Input
                type="text"
                value={productForm.notes}
                onChange={e =>
                  setProductForm({ ...productForm, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Initial stock from supplier"
              />
            </div>
            <Button
              onClick={handleCreateProduct}
              disabled={
                !productForm.name ||
                !productForm.categoryId ||
                !productForm.currentPrice ||
                !productForm.minPrice ||
                !productForm.maxPrice
              }
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              Create Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Remove Stock</DialogTitle>
            <DialogDescription>
              Decrease the stock quantity for the selected product.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Product:{' '}
              <span className="font-semibold">
                {selectedProduct?.productName}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Current Stock:{' '}
              <span className="font-semibold">{selectedProduct?.quantity}</span>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Remove
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.quantity}
                onChange={e =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference ID (Optional)
              </label>
              <Input
                type="text"
                value={formData.referenceId}
                onChange={e =>
                  setFormData({ ...formData, referenceId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., ORDER-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Sold to customer"
              />
            </div>
            <Button
              onClick={handleRemoveStock}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Remove Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Set a new stock quantity for the selected product.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Product:{' '}
              <span className="font-semibold">
                {selectedProduct?.productName}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Current Stock:{' '}
              <span className="font-semibold">{selectedProduct?.quantity}</span>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Quantity
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={e =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Inventory correction"
              />
            </div>
            <Button
              onClick={handleAdjustStock}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Adjust Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              View the transaction history for the selected product.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Product:{' '}
              <span className="font-semibold">
                {selectedProduct?.productName}
              </span>
            </p>
          </div>
          <div
            className="max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading transaction history...</p>
              </div>
            ) : transactionHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No transaction history found
              </p>
            ) : (
              <div className="space-y-3">
                {transactionHistory.map(transaction => (
                  <div
                    key={transaction.id}
                    className="border border-gray-600 rounded-lg p-4 bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          transaction.transactionType === 'PURCHASE' ||
                          transaction.transactionType === 'INITIAL'
                            ? 'bg-green-900 text-green-100'
                            : transaction.transactionType === 'SALE'
                            ? 'bg-red-900 text-red-100'
                            : 'bg-blue-900 text-blue-100'
                        }`}
                      >
                        {transaction.transactionType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Change:</span>
                        <span
                          className={`ml-1 font-semibold ${
                            Number(transaction.quantityChange) >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {Number(transaction.quantityChange) >= 0 ? '+' : ''}
                          {Number(transaction.quantityChange).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Before:</span>
                        <span className="ml-1 font-semibold text-gray-300">
                          {Number(transaction.quantityBefore).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">After:</span>
                        <span className="ml-1 font-semibold text-gray-300">
                          {Number(transaction.quantityAfter).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {transaction.notes && (
                      <p className="text-sm text-gray-300 mt-2">
                        {transaction.notes}
                      </p>
                    )}
                    {transaction.referenceId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ref: {transaction.referenceId}
                      </p>
                    )}
                    {(transaction.createdByName ||
                      transaction.createdByEmail) && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span>
                          By:{' '}
                          {transaction.createdByName ||
                            transaction.createdByEmail}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
