"use client";

import React from "react";
import TextInput from "@/app/components/ui/forms/TextInput";

interface CustomerInfoFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl: string;
}

interface CustomerInfoFormProps {
  formData: CustomerInfoFormData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomerInfoForm({
  formData,
  errors,
  onChange,
}: CustomerInfoFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Customer Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          name="customerName"
          label="Full Name"
          value={formData.customerName}
          onChange={onChange}
          placeholder="Enter your full name"
          error={errors.customerName}
          required
          maxLength={100}
        />

        <TextInput
          name="customerPhone"
          label="Phone Number"
          value={formData.customerPhone}
          onChange={onChange}
          placeholder="09XX-XXX-XXXX"
          type="tel"
          error={errors.customerPhone}
          required
          maxLength={20}
        />

        <TextInput
          name="customerEmail"
          label="Email Address (Optional)"
          value={formData.customerEmail}
          onChange={onChange}
          placeholder="your@email.com"
          type="email"
          error={errors.customerEmail}
          maxLength={100}
        />

        <TextInput
          name="customerFacebookUrl"
          label="Facebook URL (Optional)"
          value={formData.customerFacebookUrl}
          onChange={onChange}
          placeholder="https://facebook.com/yourprofile"
          type="url"
          error={errors.customerFacebookUrl}
          maxLength={200}
        />
      </div>
    </div>
  );
}
