import { Button } from '@/components/ui/button';
import {
  Edit,
  History,
  Minus,
  Plus,
  Trash,
} from 'lucide-react';
import { InventoryItem } from '../types';
import { getStockStatus } from '../utils';

interface InventoryTableProps {
  items: InventoryItem[];
  onAddStock: (item: InventoryItem) => void;
  onRemoveStock: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
  onDeleteProduct: (item: InventoryItem) => void;
}

export function InventoryTable({
  items,
  onAddStock,
  onRemoveStock,
  onAdjustStock,
  onViewHistory,
  onDeleteProduct,
}: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-3 px-4 font-semibold text-gray-300">
                Product
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">
                Current Price
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">
                Min Price
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">
                Max Price
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-300">
                Quantity
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-300">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-300">
                Last Updated
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-400">
                No inventory items found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="text-left py-3 px-4 font-semibold text-gray-300">
              Product
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">
              Current Price
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">
              Min Price
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">
              Max Price
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-300">
              Quantity
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-300">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">
              Last Updated
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const status = getStockStatus(item.quantity);
            return (
              <tr
                key={item.id}
                className="border-b border-gray-400 hover:bg-gray-800"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-300">
                    {item.productName}
                  </div>
                  <div className="text-sm text-gray-400">
                    ID: {item.productId}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-lg font-semibold text-gray-300">
                    {parseFloat(item.basePrice).toFixed(2)}€
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-lg text-gray-300">
                    {isNaN(parseFloat(item.minPrice))
                      ? '--'
                      : parseFloat(item.minPrice).toFixed(2)}
                    €
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-lg text-gray-300">
                    {isNaN(parseFloat(item.maxPrice))
                      ? '--'
                      : parseFloat(item.maxPrice).toFixed(2)}
                    €
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-lg font-semibold text-gray-300">
                    {typeof item.quantity === 'number'
                      ? item.quantity.toFixed(2)
                      : parseFloat(String(item.quantity)).toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray400">
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button
                      onClick={() => onAddStock(item)}
                      className="p-2 text-green-100 bg-green-700 hover:bg-green-800 rounded-lg transition"
                      title="Add Stock"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onRemoveStock(item)}
                      className="p-2 text-red-100 bg-red-700 hover:bg-red-800 rounded-lg transition"
                      title="Remove Stock"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onAdjustStock(item)}
                      className="p-2 text-blue-100 bg-blue-700 hover:bg-blue-800 rounded-lg transition"
                      title="Adjust Stock"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onViewHistory(item)}
                      className="p-2 text-gray-400 bg-gray-700 hover:bg-gray-800 rounded-lg transition"
                      title="View History"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onDeleteProduct(item)}
                      className="p-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
