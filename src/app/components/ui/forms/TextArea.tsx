"use client";

import React from "react";

interface TextAreaProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export default function TextArea({
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  maxLength,
  rows = 3,
  className = "",
}: TextAreaProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent text-gray-900 bg-white ${
          error ? "border-red-300" : "border-gray-400"
        } ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
