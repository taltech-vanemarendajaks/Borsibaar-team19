/**
 * Custom hook for handling all inventory-related API actions
 * Manages create, update, and delete operations for products, categories, and stock
 * Handles API calls, error handling, and callback execution after successful operations
 * @param props - Configuration object containing refetch functions, form data, and callbacks
 * @returns Object containing all action handler functions
 */
import { InventoryItem } from '../types';

interface UseInventoryActionsProps {
  refetchInventory: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  selectedProduct: InventoryItem | null;
  formData: {
    quantity: string;
    notes: string;
    referenceId: string;
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
  categoryForm: {
    name: string;
    dynamicPricing: boolean;
  };
  onCloseModals: () => void;
  onProductFormReset: () => void;
  onCategoryFormReset: () => void;
  onDeleteModalClose: () => void;
}

export function useInventoryActions({
  refetchInventory,
  refetchCategories,
  selectedProduct,
  formData,
  productForm,
  categoryForm,
  onCloseModals,
  onProductFormReset,
  onCategoryFormReset,
  onDeleteModalClose,
}: UseInventoryActionsProps) {
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
      onProductFormReset();
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
      onCloseModals();
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
      onCloseModals();
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
      onCloseModals();
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

      onCategoryFormReset();
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

      onDeleteModalClose();
      await refetchInventory();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  return {
    handleCreateProduct,
    handleAddStock,
    handleRemoveStock,
    handleAdjustStock,
    handleAddCategory,
    handleDeleteProduct,
  };
}
