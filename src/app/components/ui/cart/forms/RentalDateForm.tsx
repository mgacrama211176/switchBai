"use client";

import React, { useEffect } from "react";
import DateInput from "@/app/components/ui/forms/DateInput";

interface RentalDateFormProps {
  startDate: string;
  endDate: string;
  rentalDays: number;
  errors: Record<string, string>;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export default function RentalDateForm({
  startDate,
  endDate,
  rentalDays,
  errors,
  onStartDateChange,
  onEndDateChange,
}: RentalDateFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const maxEndDate = startDate
    ? new Date(new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    : undefined;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Rental Dates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateInput
          name="startDate"
          label="Start Date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          error={errors.startDate}
          required
          min={today}
        />
        <DateInput
          name="endDate"
          label="End Date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          error={errors.endDate}
          required
          min={startDate || today}
          max={maxEndDate}
        />
      </div>
      {rentalDays > 0 && (
        <p className="mt-4 text-sm text-gray-700">
          Rental Duration:{" "}
          <span className="font-semibold">{rentalDays} days</span>
        </p>
      )}
    </div>
  );
}
