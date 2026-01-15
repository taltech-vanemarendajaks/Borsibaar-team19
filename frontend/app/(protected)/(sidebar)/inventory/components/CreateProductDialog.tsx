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
import { Category } from '../types';

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
  onFormChange: (field: keyof ProductForm, value: string) => void;
  onConfirm: () => void;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  productForm,
  categories,
  onFormChange,
  onConfirm,
}: CreateProductDialogProps) {
  const isFormValid =
    productForm.name &&
    productForm.categoryId &&
    productForm.currentPrice &&
    productForm.minPrice &&
    productForm.maxPrice;

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
              onChange={e => onFormChange('minPrice', e.target.value)}
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
              onChange={e => onFormChange('maxPrice', e.target.value)}
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
