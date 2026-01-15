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
import { useEffect, useMemo, useState } from 'react';
import { Category, InventoryItem } from '../types';
import { ValidationResult, validateProductForm } from '../validation';

interface ProductForm {
  name: string;
  description: string;
  categoryId: string;
  currentPrice: string;
  minPrice: string;
  maxPrice: string;
  initialQuantity: string;
  notes: string;
}

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productForm: ProductForm;
  categories: Category[];
  inventory: InventoryItem[];
  onFormChange: (field: keyof ProductForm, value: string) => void;
  onConfirm: () => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  productForm,
  categories,
  inventory,
  onFormChange,
  onConfirm,
}: CreateProductDialogProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    errors: [],
  });

  // Get existing product names for duplicate checking (memoized to prevent infinite loops)
  const existingProductNames = useMemo(
    () => inventory.map(item => item.productName),
    [inventory]
  );

  // Validate form on change
  useEffect(() => {
    const result = validateProductForm(productForm, existingProductNames);
    setValidationResult(result);
  }, [productForm, existingProductNames]);

  // Helper function to get error for a specific field
  // Checks multiple possible field name variations (e.g., 'currentprice' and 'currentPrice')
  const getFieldError = (fieldName: string) => {
    return (
      validationResult.errors.find(error => error.field === fieldName) ||
      validationResult.errors.find(
        error =>
          error.field === fieldName.toLowerCase() ||
          error.field === fieldName.toLowerCase().replace(' ', '')
      )
    );
  };

  const isFormValid = validationResult.isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={e => onFormChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                getFieldError('name')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="Enter product name"
              required
            />
            {getFieldError('name') && (
              <p className="text-sm text-red-500 mt-1">
                {getFieldError('name')?.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category *
            </label>
            <Select
              value={productForm.categoryId}
              onValueChange={value => onFormChange('categoryId', value)}
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
              onChange={e => onFormChange('currentPrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                getFieldError('currentPrice') || getFieldError('currentprice')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="0.00"
              required
            />
            {(getFieldError('currentPrice') ||
              getFieldError('currentprice')) && (
              <p className="text-sm text-red-500 mt-1">
                {getFieldError('currentPrice')?.message ||
                  getFieldError('currentprice')?.message}
              </p>
            )}
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
              onChange={e => onFormChange('minPrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                getFieldError('minprice')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="0.00"
              required
            />
            {getFieldError('minprice') && (
              <p className="text-sm text-red-500 mt-1">
                {getFieldError('minprice')?.message}
              </p>
            )}
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
              onChange={e => onFormChange('maxPrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                getFieldError('maxPrice') || getFieldError('maxprice')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="0.00"
              required
            />
            {(getFieldError('maxPrice') || getFieldError('maxprice')) && (
              <p className="text-sm text-red-500 mt-1">
                {getFieldError('maxPrice')?.message ||
                  getFieldError('maxprice')?.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <Textarea
              value={productForm.description}
              onChange={e => onFormChange('description', e.target.value)}
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
              onChange={e => onFormChange('initialQuantity', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                getFieldError('initialquantity') ||
                getFieldError('Initial quantity')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="0"
            />
            {getFieldError('initialquantity') ||
            getFieldError('Initial quantity') ? (
              <p className="text-sm text-red-500 mt-1">
                {getFieldError('initialquantity')?.message ||
                  getFieldError('Initial quantity')?.message}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Leave empty or 0 for no initial stock
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <Input
              type="text"
              value={productForm.notes}
              onChange={e => onFormChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Initial stock from supplier"
            />
          </div>
          <Button
            onClick={onConfirm}
            disabled={!isFormValid}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            Create Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
