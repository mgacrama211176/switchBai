"use client";

import { useEffect } from "react";
import { HiCheckCircle, HiXCircle, HiX } from "react-icons/hi";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`flex items-start space-x-3 px-6 py-4 rounded-2xl shadow-2xl border-2 min-w-[300px] max-w-md ${
          type === "success"
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex-shrink-0">
          {type === "success" ? (
            <HiCheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <HiXCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <p
          className={`flex-1 font-medium ${
            type === "success" ? "text-green-900" : "text-red-900"
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${
            type === "success"
              ? "text-green-600 hover:text-green-800"
              : "text-red-600 hover:text-red-800"
          } transition-colors duration-300`}
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
