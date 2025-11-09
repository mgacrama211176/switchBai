"use client";

import React from "react";
import { ErrorType, getErrorType } from "@/lib/error-utils";
import { useNetworkStatus } from "@/lib/network-utils";
import { HiRefresh, HiExclamationCircle, HiWifi } from "react-icons/hi";

interface ErrorStateProps {
  error: string | Error | unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  fallbackData?: any;
  className?: string;
}

export default function ErrorState({
  error,
  onRetry,
  isRetrying = false,
  fallbackData,
  className = "",
}: ErrorStateProps) {
  const { isOnline } = useNetworkStatus();
  const errorType = getErrorType(error);
  const errorMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "An error occurred";

  const getErrorIcon = () => {
    switch (errorType) {
      case ErrorType.NetworkError:
      case ErrorType.TimeoutError:
        return <HiWifi className="w-12 h-12 text-orange-500" />;
      case ErrorType.ServerError:
        return <HiExclamationCircle className="w-12 h-12 text-red-500" />;
      default:
        return <HiExclamationCircle className="w-12 h-12 text-gray-500" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case ErrorType.NetworkError:
      case ErrorType.TimeoutError:
        return "text-orange-600";
      case ErrorType.ServerError:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      {getErrorIcon()}

      <h3 className={`text-lg font-bold mt-4 mb-2 ${getErrorColor()}`}>
        {errorType === ErrorType.NetworkError && !isOnline
          ? "You're Offline"
          : errorType === ErrorType.TimeoutError
            ? "Request Timed Out"
            : errorType === ErrorType.ServerError
              ? "Server Error"
              : "Something Went Wrong"}
      </h3>

      <p className="text-gray-600 mb-4 max-w-md">{errorMessage}</p>

      {!isOnline && (
        <div className="mb-4 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            Please check your internet connection and try again.
          </p>
        </div>
      )}

      {fallbackData && (
        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Showing cached data. Some information may be outdated.
          </p>
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying || !isOnline}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            isRetrying || !isOnline
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-funBlue text-white hover:bg-blue-600 hover:shadow-lg"
          }`}
        >
          <HiRefresh
            className={`w-5 h-5 ${isRetrying ? "animate-spin" : ""}`}
          />
          <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
        </button>
      )}
    </div>
  );
}
