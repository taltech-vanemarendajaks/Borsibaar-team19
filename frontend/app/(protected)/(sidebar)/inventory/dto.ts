/**
 * Shared DTO types matching backend DTOs
 * These types mirror the Java DTOs in backend/src/main/java/com/borsibaar/dto/
 * Ensures type safety between frontend and backend
 */

/**
 * Product creation request DTO
 * Matches ProductRequestDto.java
 */
export interface ProductRequestDto {
  name: string;
  description?: string | null;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  categoryId: number;
}

/**
 * Product response DTO
 * Matches ProductResponseDto.java
 */
export interface ProductResponseDto {
  id: number;
  name: string;
  description?: string | null;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  categoryId: number;
  categoryName: string;
}

/**
 * Category creation request DTO
 * Matches CategoryRequestDto.java
 */
export interface CategoryRequestDto {
  name: string;
  dynamicPricing?: boolean | null;
}

/**
 * Category response DTO
 * Matches CategoryResponseDto.java
 */
export interface CategoryResponseDto {
  id: number;
  name: string;
  dynamicPricing: boolean;
}

/**
 * Inventory response DTO
 * Matches InventoryResponseDto.java
 */
export interface InventoryResponseDto {
  id: number;
  organizationId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  description?: string | null;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  updatedAt: string;
}

/**
 * Add stock request DTO
 * Matches AddStockRequestDto.java
 */
export interface AddStockRequestDto {
  productId: number;
  quantity: number;
  notes?: string | null;
}

/**
 * Remove stock request DTO
 * Matches RemoveStockRequestDto.java
 */
export interface RemoveStockRequestDto {
  productId: number;
  quantity: number;
  referenceId?: string | null;
  notes?: string | null;
}

/**
 * Adjust stock request DTO
 * Matches AdjustStockRequestDto.java
 */
export interface AdjustStockRequestDto {
  productId: number;
  newQuantity: number;
  notes?: string | null;
}

/**
 * Inventory transaction response DTO
 * Matches InventoryTransactionResponseDto.java
 */
export interface InventoryTransactionResponseDto {
  id: number;
  inventoryId: number;
  transactionType: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  priceBefore?: number | null;
  priceAfter?: number | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy: string;
  createdByName?: string | null;
  createdByEmail?: string | null;
  createdAt: string;
}
