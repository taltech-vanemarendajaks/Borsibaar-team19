'use client';

/**
 * InventoryDialogs Component
 *
 * Wrapper component that renders all inventory-related modal dialogs.
 * Manages the display of 7 different dialogs:
 * - CreateProductDialog: Create new product
 * - DeleteProductDialog: Confirm product deletion
 * - CreateCategoryDialog: Create new category
 * - AddStockDialog: Add stock to inventory
 * - RemoveStockDialog: Remove stock from inventory
 * - AdjustStockDialog: Adjust stock quantity
 * - TransactionHistoryDialog: View transaction history
 *
 * All dialogs are controlled via props from the parent component.
 */
import { Category, InventoryItem, InventoryTransactionResponseDto } from '../types';
import { AddStockDialog } from './AddStockDialog';
import { AdjustStockDialog } from './AdjustStockDialog';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { CreateProductDialog } from './CreateProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';
import { RemoveStockDialog } from './RemoveStockDialog';
import { TransactionHistoryDialog } from './TransactionHistoryDialog';

interface InventoryDialogsProps {
  // Modal states
  showAddModal: boolean;
  showRemoveModal: boolean;
  showAdjustModal: boolean;
  showHistoryModal: boolean;
  showCreateProductModal: boolean;
  showDeleteProductModal: boolean;
  showCreateCategoryModal: boolean;
  selectedProduct: InventoryItem | null;
  // Modal setters
  setShowAddModal: (open: boolean) => void;
  setShowRemoveModal: (open: boolean) => void;
  setShowAdjustModal: (open: boolean) => void;
  setShowHistoryModal: (open: boolean) => void;
  setShowCreateProductModal: (open: boolean) => void;
  setShowDeleteProductModal: (open: boolean) => void;
  setShowCreateCategoryModal: (open: boolean) => void;
  setSelectedProduct: (product: InventoryItem | null) => void;
  // Form data
  formData: {
    quantity: string;
    notes: string;
    referenceId: string;
  };
  categoryForm: {
    name: string;
    dynamicPricing: boolean;
  };
  productForm: {
    name: string;
    description: string;
    categoryId: string;
    currentPrice: string;
    minPrice: string;
    maxPrice: string;
    initialQuantity: string;
    notes: string;
  };
  // Form setters
  setFormData: (data: {
    quantity: string;
    notes: string;
    referenceId: string;
  }) => void;
  setCategoryForm: (form: {
    name: string;
    dynamicPricing: boolean;
  }) => void;
  setProductForm: (form: {
    name: string;
    description: string;
    categoryId: string;
    currentPrice: string;
    minPrice: string;
    maxPrice: string;
    initialQuantity: string;
    notes: string;
  }) => void;
  // Data
  categories: Category[];
  transactionHistory: InventoryTransactionResponseDto[];
  loadingHistory: boolean;
  // Handlers
  handleCreateProduct: () => void;
  handleAddStock: () => void;
  handleRemoveStock: () => void;
  handleAdjustStock: () => void;
  handleAddCategory: () => void;
  handleDeleteProduct: (id: number) => void;
}

export function InventoryDialogs({
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
  formData,
  categoryForm,
  productForm,
  setFormData,
  setCategoryForm,
  setProductForm,
  categories,
  transactionHistory,
  loadingHistory,
  handleCreateProduct,
  handleAddStock,
  handleRemoveStock,
  handleAdjustStock,
  handleAddCategory,
  handleDeleteProduct,
}: InventoryDialogsProps) {
  return (
    <>
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
    </>
  );
}
