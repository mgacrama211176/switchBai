/**
 * Utility functions for rental form validation and formatting
 */

export function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function validatePhoneNumber(phone: string): boolean {
  // Philippine phone number validation
  const phoneRegex = /^(\+639|09)\d{9}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ""));
}

export function formatPhoneNumber(phone: string): string {
  // Format as 09XX-XXX-XXXX
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("09")) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateFormData(data: {
  customerName: string;
  phoneNumber: string;
  email: string;
  startDate: string;
  endDate: string;
  address: string;
  city: string;
  landmark: string;
  facebookUrl: string;
  idImageUrl: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.customerName = "Name must be at least 2 characters";
  }

  // Phone validation
  if (!data.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.phoneNumber =
      "Please enter a valid Philippine phone number (09XX-XXX-XXXX)";
  }

  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Start date validation
  if (!data.startDate) {
    errors.startDate = "Start date is required";
  } else {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      errors.startDate = "Start date cannot be in the past";
    }
  }

  // End date validation
  if (!data.endDate) {
    errors.endDate = "End date is required";
  } else if (data.startDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + 30);

    if (endDate <= startDate) {
      errors.endDate = "End date must be after start date";
    } else if (endDate > maxEndDate) {
      errors.endDate = "Maximum rental period is 30 days";
    }
  }

  // Address validation
  if (!data.address || data.address.trim().length < 10) {
    errors.address = "Address must be at least 10 characters";
  }

  // City validation
  if (!data.city || data.city.trim().length < 2) {
    errors.city = "City is required";
  }

  // Landmark validation
  if (!data.landmark || data.landmark.trim().length < 3) {
    errors.landmark = "Landmark must be at least 3 characters";
  }

  // Facebook URL validation (optional)
  if (data.facebookUrl && data.facebookUrl.trim()) {
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(data.facebookUrl)) {
      errors.facebookUrl = "Please enter a valid URL";
    }
  }

  // ID Image validation
  if (!data.idImageUrl || data.idImageUrl.trim().length === 0) {
    errors.idImageUrl = "Please upload a valid ID";
  }

  return errors;
}

export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export function getMaxDateString(startDate: string): string {
  if (!startDate) return "";
  const start = new Date(startDate);
  const maxDate = new Date(start);
  maxDate.setDate(start.getDate() + 30);
  return maxDate.toISOString().split("T")[0];
}

/**
 * Generate a unique rental reference number
 * Format: RNT-YYYYMMDD-XXXX
 * Example: RNT-20250122-1A2B
 */
export function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate 4 random alphanumeric characters
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `RNT-${year}${month}${day}-${randomPart}`;
}
