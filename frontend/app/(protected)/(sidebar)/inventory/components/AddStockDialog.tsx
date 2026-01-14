import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem } from '../types';

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryItem | null;
  quantity: string;
  notes: string;
  onQuantityChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
}

export function AddStockDialog({
  open,
  onOpenChange,
  product,
  quantity,
  notes,
  onQuantityChange,
  onNotesChange,
  onConfirm,
}: AddStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>
            Increase the stock quantity for the selected product.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Product:{' '}
            <span className="font-semibold">{product?.productName}</span>
          </p>
          <p className="text-sm text-gray-600">
            Current Stock:{' '}
            <span className="font-semibold">{product?.quantity}</span>
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={e => onQuantityChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="e.g., Weekly restock"
            />
          </div>
          <Button
            onClick={onConfirm}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Add Stock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
