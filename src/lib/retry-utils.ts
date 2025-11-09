/**
 * Retry utility with exponential backoff
 * Handles transient failures gracefully with configurable retry logic
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  multiplier?: number;
  jitter?: boolean;
  retryable?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  multiplier: 2,
  jitter: true,
  retryable: () => true,
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  multiplier: number,
  maxDelay: number,
  jitter: boolean,
): number {
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt);
  const delay = Math.min(exponentialDelay, maxDelay);

  if (jitter) {
    // Add random jitter (±20%) to prevent thundering herd
    const jitterAmount = delay * 0.2;
    const randomJitter = (Math.random() * 2 - 1) * jitterAmount;
    return Math.max(0, delay + randomJitter);
  }

  return delay;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after max attempts
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!config.retryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxAttempts - 1) {
        break;
      }

      // Calculate delay and wait before retrying
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.multiplier,
        config.maxDelay,
        config.jitter,
      );

      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}
