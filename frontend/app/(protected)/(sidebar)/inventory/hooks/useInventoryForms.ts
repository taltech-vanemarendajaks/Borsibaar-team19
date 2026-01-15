/**
 * Custom hook for managing form state across all inventory forms
 * Manages state for stock operations, category creation, and product creation forms
 * Provides reset functions to clear form data after submission
 * @returns Object containing form states, setters, and reset functions
 */
import { useState } from 'react';

export function useInventoryForms() {
  const [formData, setFormData] = useState({
    quantity: '',
    notes: '',
    referenceId: '',
  });

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

  const resetFormData = () => {
    setFormData({ quantity: '', notes: '', referenceId: '' });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      dynamicPricing: true,
    });
  };

  const resetProductForm = () => {
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
  };

  return {
    formData,
    categoryForm,
    productForm,
    setFormData,
    setCategoryForm,
    setProductForm,
    resetFormData,
    resetCategoryForm,
    resetProductForm,
  };
}
