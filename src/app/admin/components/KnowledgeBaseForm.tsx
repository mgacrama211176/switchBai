"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Toast from "./Toast";

// Shared type matching API response (with timestamps)
export interface KnowledgeBaseEntry {
  _id: string;
  question: string;
  answer: string;
  category: "payment" | "rental" | "trade" | "shipping" | "general";
  metadata?: {
    tags?: string[];
    priority?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Input type for form (without timestamps, _id optional for create mode)
export interface KnowledgeBaseEntryInput {
  _id?: string;
  question: string;
  answer: string;
  category: "payment" | "rental" | "trade" | "shipping" | "general";
  metadata?: {
    tags?: string[];
    priority?: number;
  };
}

interface KnowledgeBaseFormProps {
  mode: "create" | "edit";
  initialData?: KnowledgeBaseEntryInput;
  onSuccess: (entry: KnowledgeBaseEntry) => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: "payment", label: "Payment" },
  { value: "rental", label: "Rental" },
  { value: "trade", label: "Trade" },
  { value: "shipping", label: "Shipping" },
  { value: "general", label: "General" },
];

export default function KnowledgeBaseForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: KnowledgeBaseFormProps) {
  const [formData, setFormData] = useState({
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    category: initialData?.category || "general",
    tags: initialData?.metadata?.tags?.join(", ") || "",
    priority: initialData?.metadata?.priority || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    } else if (formData.question.length > 500) {
      newErrors.question = "Question cannot exceed 500 characters";
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "Answer is required";
    } else if (formData.answer.length > 2000) {
      newErrors.answer = "Answer cannot exceed 2000 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.priority < 0) {
      newErrors.priority = "Priority cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: "Please fix the errors in the form", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        metadata: {
          tags: tagsArray,
          priority: formData.priority,
        },
      };

      const url =
        mode === "create"
          ? "/api/knowledge-base"
          : `/api/knowledge-base/${initialData?._id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: `Knowledge base entry ${mode === "create" ? "created" : "updated"} successfully!`,
          type: "success",
        });
        setTimeout(() => {
          onSuccess(data.data);
        }, 1000);
      } else {
        setToast({
          message: data.error || "Operation failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setToast({ message: "An error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Question *
          </label>
          <input
            id="question"
            name="question"
            type="text"
            value={formData.question}
            onChange={handleInputChange}
            maxLength={500}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.question ? "border-lameRed" : "border-gray-200"
            } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            placeholder="What payment methods do you accept?"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.question && (
              <p className="text-sm text-lameRed">{errors.question}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.question.length}/500 characters
            </p>
          </div>
        </div>

        {/* Answer */}
        <div>
          <label
            htmlFor="answer"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Answer *
          </label>
          <textarea
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleInputChange}
            rows={6}
            maxLength={2000}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.answer ? "border-lameRed" : "border-gray-200"
            } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            placeholder="We accept Cash, GCash, Bank Transfer, and Meet-up payments..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.answer && (
              <p className="text-sm text-lameRed">{errors.answer}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.answer.length}/2000 characters
            </p>
          </div>
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.category ? "border-lameRed" : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-lameRed mt-1">{errors.category}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Priority
            </label>
            <input
              id="priority"
              name="priority"
              type="number"
              value={formData.priority}
              onChange={handleInputChange}
              min="0"
              step="1"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.priority ? "border-lameRed" : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black`}
              placeholder="0"
            />
            {errors.priority && (
              <p className="text-sm text-lameRed mt-1">{errors.priority}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Higher priority entries appear first in search results
            </p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300 text-black"
            placeholder="payment, gcash, cash"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-funBlue to-blue-500 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
                ? "Create Entry"
                : "Update Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
