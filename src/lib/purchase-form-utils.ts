// Purchase form utilities for validation, pricing, and formatting

export interface PurchaseFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl?: string;
  gameBarcode: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes?: string;
  quantity: number;
  paymentMethod: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Metro Manila cities for delivery
export const METRO_MANILA_CITIES = [
  "Caloocan",
  "Las Piñas",
  "Makati",
  "Malabon",
  "Mandaluyong",
  "Manila",
  "Marikina",
  "Muntinlupa",
  "Navotas",
  "Parañaque",
  "Pasay",
  "Pasig",
  "Pateros",
  "Quezon City",
  "San Juan",
  "Taguig",
  "Valenzuela",
];

// Validation functions
export function validatePurchaseData(data: PurchaseFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Customer name validation
  if (!data.customerName.trim()) {
    errors.customerName = "Full name is required";
  } else if (data.customerName.trim().length < 2) {
    errors.customerName = "Name must be at least 2 characters";
  } else if (data.customerName.trim().length > 100) {
    errors.customerName = "Name must be less than 100 characters";
  }

  // Phone validation
  if (!data.customerPhone.trim()) {
    errors.customerPhone = "Phone number is required";
  } else {
    const phoneRegex = /^09\d{9}$/;
    const cleanPhone = data.customerPhone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      errors.customerPhone =
        "Please enter a valid Philippine mobile number (09XXXXXXXXX)";
    }
  }

  // Email validation (optional)
  if (data.customerEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail.trim())) {
      errors.customerEmail = "Please enter a valid email address";
    }
  }

  // Facebook URL validation (optional)
  if (data.customerFacebookUrl && data.customerFacebookUrl.trim()) {
    try {
      new URL(data.customerFacebookUrl);
      if (!data.customerFacebookUrl.includes("facebook.com")) {
        errors.customerFacebookUrl =
          "Please enter a valid Facebook profile URL";
      }
    } catch {
      errors.customerFacebookUrl = "Please enter a valid Facebook profile URL";
    }
  }

  // Game barcode validation
  if (!data.gameBarcode.trim()) {
    errors.gameBarcode = "Game selection is required";
  }

  // Delivery address validation
  if (!data.deliveryAddress.trim()) {
    errors.deliveryAddress = "Delivery address is required";
  } else if (data.deliveryAddress.trim().length < 10) {
    errors.deliveryAddress = "Please provide a more detailed address";
  } else if (data.deliveryAddress.trim().length > 500) {
    errors.deliveryAddress = "Address must be less than 500 characters";
  }

  // City validation
  if (!data.deliveryCity.trim()) {
    errors.deliveryCity = "City is required";
  }

  // Landmark validation
  if (!data.deliveryLandmark.trim()) {
    errors.deliveryLandmark = "Landmark is required";
  } else if (data.deliveryLandmark.trim().length < 3) {
    errors.deliveryLandmark = "Please provide a more specific landmark";
  } else if (data.deliveryLandmark.trim().length > 200) {
    errors.deliveryLandmark = "Landmark must be less than 200 characters";
  }

  // Delivery notes validation (optional)
  if (data.deliveryNotes && data.deliveryNotes.trim().length > 500) {
    errors.deliveryNotes = "Delivery notes must be less than 500 characters";
  }

  // Quantity validation
  if (data.quantity < 1) {
    errors.quantity = "Quantity must be at least 1";
  } else if (data.quantity > 5) {
    errors.quantity = "Maximum quantity is 5";
  }

  // Payment method validation
  const validPaymentMethods = ["cod", "bank_transfer", "gcash", "cash"];
  if (
    !data.paymentMethod ||
    !validPaymentMethods.includes(data.paymentMethod)
  ) {
    errors.paymentMethod = "Please select a valid payment method";
  }

  return errors;
}

// Delivery fee calculation
export function calculateDeliveryFee(city: string): number {
  if (!city) return 0;

  // Free delivery for Metro Manila cities
  if (METRO_MANILA_CITIES.includes(city)) {
    return 0;
  }

  // Provincial delivery fee
  return 150;
}

// Total calculation
export function calculateTotal(subtotal: number, deliveryFee: number): number {
  return subtotal + deliveryFee;
}

// Price formatting
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Date formatting
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

// Generate order number
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `SB${year}${month}${day}${random}`;
}

// Validate phone number format
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("09")) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return phone;
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

// Validate game availability
export function validateGameAvailability(
  requestedQuantity: number,
  availableStocks: number,
): boolean {
  return requestedQuantity <= availableStocks && requestedQuantity > 0;
}

// Get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  const methods: { [key: string]: string } = {
    cod: "Cash on Delivery (COD)",
    bank_transfer: "Bank Transfer",
    gcash: "GCash",
  };
  return methods[method] || method;
}

// Get status display name
export function getStatusDisplayName(status: string): string {
  const statuses: { [key: string]: string } = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return statuses[status] || status;
}

// Calculate estimated delivery time
export function getEstimatedDeliveryTime(city: string): string {
  if (METRO_MANILA_CITIES.includes(city)) {
    return "1-2 business days";
  }
  return "3-5 business days";
}
