import axios from "axios";

/**
 * Error classification types
 */
export enum ErrorType {
  NetworkError = "NETWORK_ERROR",
  ServerError = "SERVER_ERROR",
  ClientError = "CLIENT_ERROR",
  AuthError = "AUTH_ERROR",
  ValidationError = "VALIDATION_ERROR",
  TimeoutError = "TIMEOUT_ERROR",
  UnknownError = "UNKNOWN_ERROR",
}

/**
 * Custom error class with type classification
 */
export class ClassifiedError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: any;

  constructor(
    message: string,
    type: ErrorType,
    statusCode?: number,
    originalError?: any,
  ) {
    super(message);
    this.name = "ClassifiedError";
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ClassifiedError.prototype);
  }
}

/**
 * Classify an error based on its properties
 */
export function classifyError(error: any): ClassifiedError {
  // Axios errors
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const code = error.code;

    // Network errors (no response received)
    if (!error.response) {
      if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
        return new ClassifiedError(
          "Request timed out. Please check your connection and try again.",
          ErrorType.TimeoutError,
          undefined,
          error,
        );
      }

      if (
        code === "ECONNREFUSED" ||
        code === "ENOTFOUND" ||
        code === "ERR_NETWORK"
      ) {
        return new ClassifiedError(
          "Unable to connect to the server. Please check your internet connection.",
          ErrorType.NetworkError,
          undefined,
          error,
        );
      }

      return new ClassifiedError(
        "Network error occurred. Please try again.",
        ErrorType.NetworkError,
        undefined,
        error,
      );
    }

    // HTTP status code errors
    if (statusCode) {
      // 5xx Server errors
      if (statusCode >= 500) {
        return new ClassifiedError(
          error.response?.data?.error ||
            "Server error occurred. Please try again later.",
          ErrorType.ServerError,
          statusCode,
          error,
        );
      }

      // 401/403 Auth errors
      if (statusCode === 401 || statusCode === 403) {
        return new ClassifiedError(
          error.response?.data?.error || "Authentication required.",
          ErrorType.AuthError,
          statusCode,
          error,
        );
      }

      // 400 Validation errors
      if (statusCode === 400) {
        return new ClassifiedError(
          error.response?.data?.error ||
            "Invalid request. Please check your input.",
          ErrorType.ValidationError,
          statusCode,
          error,
        );
      }

      // Other 4xx Client errors
      if (statusCode >= 400) {
        return new ClassifiedError(
          error.response?.data?.error || "Request failed. Please try again.",
          ErrorType.ClientError,
          statusCode,
          error,
        );
      }
    }
  }

  // ClassifiedError (already classified)
  if (error instanceof ClassifiedError) {
    return error;
  }

  // Generic Error objects
  if (error instanceof Error) {
    return new ClassifiedError(
      error.message || "An unexpected error occurred.",
      ErrorType.UnknownError,
      undefined,
      error,
    );
  }

  // Unknown error type
  return new ClassifiedError(
    "An unexpected error occurred.",
    ErrorType.UnknownError,
    undefined,
    error,
  );
}

/**
 * Check if an error is retryable
 * Network errors and 5xx server errors are retryable
 */
export function isRetryableError(error: any): boolean {
  const classified = classifyError(error);

  return (
    classified.type === ErrorType.NetworkError ||
    classified.type === ErrorType.ServerError ||
    classified.type === ErrorType.TimeoutError
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const classified = classifyError(error);
  return classified.message;
}

/**
 * Get error type for UI display
 */
export function getErrorType(error: any): ErrorType {
  return classifyError(error).type;
}
