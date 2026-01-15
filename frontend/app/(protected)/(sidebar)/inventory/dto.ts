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
