"use client";

import React from "react";
import TextInput from "@/app/components/ui/forms/TextInput";
import TextArea from "@/app/components/ui/forms/TextArea";

interface DeliveryInfoFormData {
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes: string;
}

interface DeliveryInfoFormProps {
  formData: DeliveryInfoFormData;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export default function DeliveryInfoForm({
  formData,
  errors,
  onChange,
}: DeliveryInfoFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Delivery Information
      </h2>
      <div className="space-y-6">
        <TextArea
          name="deliveryAddress"
          label="Complete Address"
          value={formData.deliveryAddress}
          onChange={onChange}
          placeholder="House number, street, barangay"
          error={errors.deliveryAddress}
          required
          maxLength={500}
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            name="deliveryCity"
            label="City"
            value={formData.deliveryCity}
            onChange={onChange}
            placeholder="Enter your city"
            error={errors.deliveryCity}
            required
            maxLength={100}
          />

          <TextInput
            name="deliveryLandmark"
            label="Landmark"
            value={formData.deliveryLandmark}
            onChange={onChange}
            placeholder="Near mall, school, etc."
            error={errors.deliveryLandmark}
            required
            maxLength={200}
          />
        </div>

        <TextArea
          name="deliveryNotes"
          label="Delivery Notes (Optional)"
          value={formData.deliveryNotes}
          onChange={onChange}
          placeholder="Special delivery instructions"
          maxLength={500}
          rows={2}
        />
      </div>
    </div>
  );
}
