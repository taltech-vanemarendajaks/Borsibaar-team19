/**
 * Inventory module type definitions
 * Centralized type definitions for inventory-related data structures
 */

// Import DTO types for use in type aliases
import type { CategoryResponseDto, InventoryResponseDto } from './dto';

// Re-export DTO types from shared DTO file
export type {
  CategoryResponseDto,
  InventoryResponseDto,
  InventoryTransactionResponseDto,
  ProductResponseDto,
} from './dto';

/**
 * Inventory item with product information and current stock level
 * Type alias for InventoryResponseDto - matches backend exactly
 */
export type InventoryItem = InventoryResponseDto;

/**
 * Product category with dynamic pricing flag
 * Type alias for CategoryResponseDto - matches backend exactly
 */
export type Category = CategoryResponseDto;

/**
 * Stock status styling and label information
 * Used for displaying stock level indicators in the UI
 */
export interface StockStatus {
  color: string; // Tailwind CSS text color class
  bg: string; // Tailwind CSS background color class
  label: string; // Human-readable status label
}
