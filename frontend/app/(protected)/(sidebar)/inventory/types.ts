/**
 * Inventory module type definitions
 * Centralized type definitions for inventory-related data structures
 */

/**
 * Transaction history response from the backend API
 */
export interface InventoryTransactionResponseDto {
  id: number;
  inventoryId: number;
  transactionType: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt: string;
}

/**
 * Inventory item with product information and current stock level
 */
export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  basePrice: string;
  minPrice: string;
  maxPrice: string;
  quantity: number;
  updatedAt: string;
}

/**
 * Product category with dynamic pricing flag
 */
export interface Category {
  id: number;
  name: string;
  dynamicPricing: boolean;
}

/**
 * Stock status styling and label information
 * Used for displaying stock level indicators in the UI
 */
export interface StockStatus {
  color: string; // Tailwind CSS text color class
  bg: string; // Tailwind CSS background color class
  label: string; // Human-readable status label
}
