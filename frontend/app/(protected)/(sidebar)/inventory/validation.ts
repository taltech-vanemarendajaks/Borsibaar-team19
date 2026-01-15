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

/**
 * Validates a product name
 * Checks for empty name, minimum length, and duplicate names
 * @param name - Product name to validate
 * @param existingNames - Array of existing product names (for duplicate check)
 * @returns Validation error or null if valid
 */
export function validateProductName(
  name: string,
  existingNames: string[] = []
): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: 'name',
      message: 'Product name is required',
    };
  }

  if (name.trim().length < 2) {
    return {
      field: 'name',
      message: 'Product name must be at least 2 characters',
    };
  }

  const normalizedName = name.trim().toLowerCase();
  if (
    existingNames.some(existing => existing.toLowerCase() === normalizedName)
  ) {
    return {
      field: 'name',
      message: 'A product with this name already exists',
    };
  }

  return null;
}
