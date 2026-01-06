import { useState, useCallback } from "react";
import { validatePurchaseData } from "@/lib/purchase-form-utils";

export interface CartFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes: string;
  paymentMethod: string;
}

const initialFormData: CartFormData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerFacebookUrl: "",
  deliveryAddress: "",
  deliveryCity: "",
  deliveryLandmark: "",
  deliveryNotes: "",
  paymentMethod: "cod",
};

export function useCartForm() {
  const [formData, setFormData] = useState<CartFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  const validateForm = useCallback(
    (
      cartType: "purchase" | "rental" | "trade" | null,
      cartItemsLength: number,
    ) => {
      if (cartItemsLength === 0) {
        setErrors({ submit: "Your cart is empty" });
        return false;
      }

      if (!cartType) {
        setErrors({
          submit: "Please select cart type (Purchase, Rental, or Trade)",
        });
        return false;
      }

      // Validate purchase/rental form data
      if (cartType === "purchase" || cartType === "rental") {
        const validationErrors = validatePurchaseData({
          ...formData,
          gameBarcode: "dummy", // Not used in validation
          quantity: 1,
        });

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
      }

      return true;
    },
    [formData, setErrors],
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    setErrors,
    handleInputChange,
    validateForm,
    resetForm,
  };
}
