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

/**
 * Validates a price value
 * Checks for empty value, valid number, and non-negative value
 * @param price - Price string to validate
 * @param fieldName - Field name for error message (e.g., "Current price", "Min price")
 * @returns Validation error or null if valid
 */
export function validatePrice(
  price: string,
  fieldName: string
): ValidationError | null {
  if (!price || price.trim().length === 0) {
    return {
      field: fieldName.toLowerCase().replace(' ', ''),
      message: `${fieldName} is required`,
    };
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) {
    return {
      field: fieldName.toLowerCase().replace(' ', ''),
      message: `${fieldName} must be a valid number`,
    };
  }

  if (priceNum < 0) {
    return {
      field: fieldName.toLowerCase().replace(' ', ''),
      message: `${fieldName} cannot be negative`,
    };
  }

  return null;
}

/**
 * Validates price range (min <= max)
 * Checks that minimum price is less than or equal to maximum price
 * @param minPrice - Minimum price string
 * @param maxPrice - Maximum price string
 * @returns Validation error or null if valid
 */
export function validatePriceRange(
  minPrice: string,
  maxPrice: string
): ValidationError | null {
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);

  // Only validate if both are valid numbers
  if (isNaN(min) || isNaN(max)) {
    return null; // Let other validators handle NaN cases
  }

  if (min > max) {
    return {
      field: 'maxPrice',
      message: 'Max price must be greater than or equal to min price',
    };
  }

  return null;
}

/**
 * Validates that current price is within min-max range
 * Checks that current price is between min and max price (inclusive)
 * @param currentPrice - Current price string
 * @param minPrice - Minimum price string
 * @param maxPrice - Maximum price string
 * @returns Validation error or null if valid
 */
export function validateCurrentPriceInRange(
  currentPrice: string,
  minPrice: string,
  maxPrice: string
): ValidationError | null {
  const current = parseFloat(currentPrice);
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);

  // Only validate if all are valid numbers
  if (isNaN(current) || isNaN(min) || isNaN(max)) {
    return null; // Let other validators handle NaN cases
  }

  if (current < min || current > max) {
    return {
      field: 'currentPrice',
      message: 'Current price must be between min and max price',
    };
  }

  return null;
}

/**
 * Validates a quantity value
 * Checks for empty value, valid number, non-negative value, and optionally non-zero
 * @param quantity - Quantity string to validate
 * @param fieldName - Field name for error message (default: "quantity")
 * @param allowZero - Whether zero is allowed (default: false)
 * @returns Validation error or null if valid
 */
export function validateQuantity(
  quantity: string,
  fieldName: string = 'quantity',
  allowZero: boolean = false
): ValidationError | null {
  if (!quantity || quantity.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }

  const qty = parseFloat(quantity);
  if (isNaN(qty)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`,
    };
  }

  if (qty < 0) {
    return {
      field: fieldName,
      message: `${fieldName} cannot be negative`,
    };
  }

  if (!allowZero && qty === 0) {
    return {
      field: fieldName,
      message: `${fieldName} must be greater than zero`,
    };
  }

  return null;
}

/**
 * Validates a category name
 * Checks for empty name, minimum length, and duplicate names
 * @param name - Category name to validate
 * @param existingNames - Array of existing category names (for duplicate check)
 * @returns Validation error or null if valid
 */
export function validateCategoryName(
  name: string,
  existingNames: string[] = []
): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: 'name',
      message: 'Category name is required',
    };
  }

  if (name.trim().length < 2) {
    return {
      field: 'name',
      message: 'Category name must be at least 2 characters',
    };
  }

  const normalizedName = name.trim().toLowerCase();
  if (
    existingNames.some(existing => existing.toLowerCase() === normalizedName)
  ) {
    return {
      field: 'name',
      message: 'A category with this name already exists',
    };
  }

  return null;
}

/**
 * Validates a complete product form
 * Combines all product validation checks into a single function.
 * Performs comprehensive validation including:
 * - Product name (required, min length, no duplicates)
 * - Category selection (required)
 * - All price fields (required, non-negative, valid numbers)
 * - Price range validation (min <= max)
 * - Current price within min-max range
 * - Initial quantity (optional, but validated if provided)
 *
 * @param productForm - Product form data to validate
 * @param existingProductNames - Array of existing product names (for duplicate check)
 * @returns ValidationResult with isValid flag and array of errors
 */
export function validateProductForm(
  productForm: {
    name: string;
    categoryId: string;
    currentPrice: string;
    minPrice: string;
    maxPrice: string;
    initialQuantity: string;
  },
  existingProductNames: string[] = []
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  const nameError = validateProductName(productForm.name, existingProductNames);
  if (nameError) errors.push(nameError);

  // Validate category
  if (!productForm.categoryId || productForm.categoryId.trim().length === 0) {
    errors.push({
      field: 'categoryId',
      message: 'Category is required',
    });
  }

  // Validate prices
  const minPriceError = validatePrice(productForm.minPrice, 'Min price');
  if (minPriceError) errors.push(minPriceError);

  const maxPriceError = validatePrice(productForm.maxPrice, 'Max price');
  if (maxPriceError) errors.push(maxPriceError);

  const currentPriceError = validatePrice(
    productForm.currentPrice,
    'Current price'
  );
  if (currentPriceError) errors.push(currentPriceError);

  // Validate price range (only if both are valid numbers)
  if (!minPriceError && !maxPriceError) {
    const rangeError = validatePriceRange(
      productForm.minPrice,
      productForm.maxPrice
    );
    if (rangeError) errors.push(rangeError);
  }

  // Validate current price is in range (only if all prices are valid)
  if (!minPriceError && !maxPriceError && !currentPriceError) {
    const rangeError = validateCurrentPriceInRange(
      productForm.currentPrice,
      productForm.minPrice,
      productForm.maxPrice
    );
    if (rangeError) errors.push(rangeError);
  }

  // Validate initial quantity (optional field, but if provided must be valid)
  if (
    productForm.initialQuantity &&
    productForm.initialQuantity.trim().length > 0
  ) {
    const qtyError = validateQuantity(
      productForm.initialQuantity,
      'Initial quantity',
      true
    );
    if (qtyError) errors.push(qtyError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a complete category form
 * Combines all category validation checks into a single function.
 * Validates category name (required, min length, no duplicates).
 *
 * @param categoryForm - Category form data to validate
 * @param existingCategoryNames - Array of existing category names (for duplicate check)
 * @returns ValidationResult with isValid flag and array of errors
 */
export function validateCategoryForm(
  categoryForm: { name: string },
  existingCategoryNames: string[] = []
): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateCategoryName(
    categoryForm.name,
    existingCategoryNames
  );
  if (nameError) errors.push(nameError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates stock quantity for add/remove/adjust operations
 * Wrapper around validateQuantity with stock-specific defaults.
 * Validates that quantity is required, a valid number, non-negative, and greater than zero.
 * Use this for add/remove operations where zero is not allowed.
 *
 * @param quantity - Quantity string to validate
 * @returns ValidationResult with isValid flag and array of errors
 */
export function validateStockQuantity(quantity: string): ValidationResult {
  const errors: ValidationError[] = [];

  const qtyError = validateQuantity(quantity, 'quantity', false);
  if (qtyError) errors.push(qtyError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
