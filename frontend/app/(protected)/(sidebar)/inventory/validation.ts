/**
 * Inventory validation utilities
 * Provides validation functions for product, category, and stock operations
 */

/**
 * Represents a single validation error for a specific field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result of a validation operation
 * Contains isValid flag and array of validation errors
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
