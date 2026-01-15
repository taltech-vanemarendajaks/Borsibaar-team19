/**
 * Inventory utility functions
 * Reusable helper functions for inventory management
 */

import { InventoryItem, StockStatus } from './types';

/**
 * Determines the stock status based on quantity
 * @param quantity - Current stock quantity (number or string)
 * @returns StockStatus object with color classes and label
 * @example
 * getStockStatus(0) // { color: "text-red-100", bg: "bg-red-900", label: "Out of Stock" }
 * getStockStatus(5) // { color: "text-yellow-600", bg: "bg-yellow-50", label: "Low Stock" }
 * getStockStatus(20) // { color: "text-green-100", bg: "bg-green-900", label: "In Stock" }
 */
export function getStockStatus(quantity: number | string): StockStatus {
  const qty = parseFloat(quantity.toString());
  if (qty === 0)
    return { color: 'text-red-100', bg: 'bg-red-900', label: 'Out of Stock' };
  if (qty < 10)
    return {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Low Stock',
    };
  return { color: 'text-green-100', bg: 'bg-green-900', label: 'In Stock' };
}

/**
 * Filters inventory items by product name
 * Case-insensitive search that matches product names containing the search term
 * @param inventory - Array of inventory items to filter
 * @param searchTerm - Search query string
 * @returns Filtered array of inventory items
 * @example
 * filterInventory(items, "beer") // Returns items with "beer" in productName
 * filterInventory(items, "") // Returns all items
 */
export function filterInventory(
  inventory: InventoryItem[],
  searchTerm: string
): InventoryItem[] {
  if (!searchTerm?.trim().length) return inventory;

  return inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
