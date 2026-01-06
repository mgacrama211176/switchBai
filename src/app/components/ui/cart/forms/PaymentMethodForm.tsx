"use client";

import React from "react";
import RadioGroup from "@/app/components/ui/forms/RadioGroup";

interface PaymentMethodFormProps {
  paymentMethod: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const paymentOptions = [
  {
    value: "cod",
    label: "Cash on Delivery (COD)",
    description: "Pay when your order arrives",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "Transfer to our bank account",
  },
  {
    value: "gcash",
    label: "GCash",
    description: "Pay via GCash mobile wallet",
  },
  {
    value: "cash",
    label: "Cash (Meet-up)",
    description: "Pay cash when we meet up",
  },
];

export default function PaymentMethodForm({
  paymentMethod,
  error,
  onChange,
}: PaymentMethodFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method *</h2>
      <RadioGroup
        name="paymentMethod"
        label=""
        value={paymentMethod}
        onChange={onChange}
        options={paymentOptions}
        error={error}
        required
      />
    </div>
  );
}
