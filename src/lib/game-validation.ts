export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateGameForm(
  formData: Record<string, any>,
): ValidationResult {
  const errors: Record<string, string> = {};

  // Game Title
  if (!formData.gameTitle?.trim()) {
    errors.gameTitle = "Game title is required";
  }

  // Platform
  if (
    !formData.gamePlatform ||
    (Array.isArray(formData.gamePlatform) && formData.gamePlatform.length === 0)
  ) {
    errors.gamePlatform = "At least one platform is required";
  }

  // Ratings
  const validRatings = ["E", "E10+", "T", "M"];
  if (!formData.gameRatings) {
    errors.gameRatings = "Rating is required";
  } else if (!validRatings.includes(formData.gameRatings)) {
    errors.gameRatings = "Invalid rating selection";
  }

  // Barcode
  if (!formData.gameBarcode?.trim()) {
    errors.gameBarcode = "Barcode is required";
  } else if (!/^\d{10,13}$/.test(formData.gameBarcode)) {
    errors.gameBarcode = "Barcode must be 10-13 digits";
  }

  // Description
  if (!formData.gameDescription?.trim()) {
    errors.gameDescription = "Description is required";
  } else if (formData.gameDescription.trim().length < 20) {
    errors.gameDescription = "Description must be at least 20 characters";
  }

  // Image URL
  if (!formData.gameImageURL?.trim()) {
    errors.gameImageURL = "Image is required";
  } else if (formData.gameImageURL === "file://selected") {
    // This indicates a file has been selected and will be uploaded
    // No validation error needed
  } else {
    // Validate image URL format (local paths with extensions or HTTP URLs)
    const imageUrlRegex = /^(\/.*\.(jpg|jpeg|png|webp)|https?:\/\/.+)$/i;
    if (!imageUrlRegex.test(formData.gameImageURL.trim())) {
      errors.gameImageURL = "Image URL must be a valid image URL or local path";
    }
  }

  // Stock Variants
  const stockWithCase = formData.stockWithCase ?? 0;
  const stockCartridgeOnly = formData.stockCartridgeOnly ?? 0;
  const totalStock = stockWithCase + stockCartridgeOnly;

  if (stockWithCase < 0) {
    errors.stockWithCase = "Stock with case cannot be negative";
  }
  if (stockCartridgeOnly < 0) {
    errors.stockCartridgeOnly = "Stock cartridge only cannot be negative";
  }
  if (totalStock === 0) {
    errors.stockWithCase = "At least one variant must have stock";
    errors.stockCartridgeOnly = "At least one variant must have stock";
  }

  // Price
  if (!formData.gamePrice || formData.gamePrice === "") {
    errors.gamePrice = "Price is required";
  } else if (formData.gamePrice <= 0) {
    errors.gamePrice = "Price must be greater than 0";
  }

  // Category
  const validCategories = [
    "RPG",
    "Platformer",
    "Action-Adventure",
    "Racing",
    "Simulation",
    "Fighting",
    "Shooter",
    "Strategy",
    "Action",
    "Sports",
  ];
  if (!formData.gameCategory) {
    errors.gameCategory = "Category is required";
  } else if (!validCategories.includes(formData.gameCategory)) {
    errors.gameCategory = "Invalid category selection";
  }

  // Release Date
  if (!formData.gameReleaseDate) {
    errors.gameReleaseDate = "Release date is required";
  }

  // Rental Weekly Rate (only if rental is available)
  if (formData.rentalAvailable && !formData.rentalWeeklyRate) {
    errors.rentalWeeklyRate =
      "Weekly rate is required when rental is available";
  }

  // Sale Price (only if game is on sale)
  if (formData.isOnSale) {
    if (!formData.salePrice || formData.salePrice === "") {
      errors.salePrice = "Sale price is required when game is on sale";
    } else if (formData.salePrice <= 0) {
      errors.salePrice = "Sale price must be greater than 0";
    } else if (formData.gamePrice && formData.salePrice >= formData.gamePrice) {
      errors.salePrice = "Sale price must be less than the original price";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
