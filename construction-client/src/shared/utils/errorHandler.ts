/**
 * Error Logging & Handling Utilities
 * 
 * Provides centralized error logging, formatting, and reporting
 * for the application.
 */

export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLog {
  level: ErrorLevel;
  message: string;
  errorId: string;
  code?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
  url: string;
  userAgent: string;
}

/**
 * Generate unique error ID for tracking
 */
export const generateErrorId = (): string => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format error for logging
 */
export const formatError = (error: unknown): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'An unknown error occurred',
  };
};

/**
 * Log error with metadata
 */
export const logError = (
  error: unknown,
  level: ErrorLevel = 'error',
  context?: Record<string, unknown>
): ErrorLog => {
  const errorId = generateErrorId();
  const { message, stack } = formatError(error);
  const timestamp = new Date().toISOString();

  const errorLog: ErrorLog = {
    level,
    message,
    errorId,
    context,
    timestamp,
    stack,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    const prefix = `[${level.toUpperCase()}] ${errorId}`;
    console.group(prefix);
    console.error('Message:', message);
    if (stack) console.error('Stack:', stack);
    if (context) console.error('Context:', context);
    console.error('Timestamp:', timestamp);
    console.groupEnd();
  }

  // Send to error tracking service in production
  if (import.meta.env.PROD) {
    void sendErrorToService(errorLog);
  }

  return errorLog;
};

/**
 * Send error to external tracking service
 * Configure with your error tracking service (Sentry, Rollbar, etc.)
 */
export const sendErrorToService = async (_errorLog: ErrorLog): Promise<void> => {
  try {
    // Example: Send to custom backend endpoint
    // const response = await fetch('/api/logs/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // });
    
    // if (!response.ok) {
    //   console.error('Failed to send error log:', response.statusText);
    // }

    // Example: Send to Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(errorLog.message), {
    //     level: errorLog.level,
    //     tags: { errorId: errorLog.errorId },
    //   });
    // }
  } catch (err) {
    console.error('Error logging service failed:', err);
  }
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  readonly code?: string;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * API error handler
 */
export class ApiError extends AppError {
  readonly statusCode?: number;
  readonly response?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    response?: unknown
  ) {
    super(message, `API_ERROR_${statusCode}`);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Validation error handler
 */
export class ValidationError extends AppError {
  readonly fields?: Record<string, string[]>;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error handler
 */
export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Handle async errors safely
 */
export const asyncHandler = async <T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    logError(error, 'error');
    return fallback;
  }
};

/**
 * Retry logic with exponential backoff
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const backoffDelay = delay * Math.pow(2, i);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError;
};

/**
 * User-friendly error message mapping
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof ValidationError) {
    return 'Please check your input and try again.';
  }

  if (error instanceof AuthError) {
    return 'Authentication failed. Please log in again.';
  }

  if (error instanceof ApiError) {
    // Check if response contains detailed error messages
    if (error.response && typeof error.response === 'object') {
      const response = error.response as {
        message?: string;
        errors?: string[] | Record<string, string[]>;
        error?: string;
      };

      // Handle validation errors with errors array
      if (response.errors) {
        if (Array.isArray(response.errors)) {
          // Join all error messages
          return response.errors.join('. ');
        } else if (typeof response.errors === 'object') {
          // Handle field-specific errors
          const errorMessages: string[] = [];
          Object.entries(response.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          });
          return errorMessages.join('. ');
        }
      }

      // Return the message from response if available
      if (response.message) {
        return response.message;
      }

      // Return error field if message is not available
      if (response.error) {
        return response.error;
      }
    }

    // Use the error message directly if it's meaningful
    if (error.message && error.message !== 'Request failed') {
      return error.message;
    }

    // Fallback to status code specific messages
    if (error.statusCode === 400) {
      return 'Please check your input and try again.';
    }
    if (error.statusCode === 401) {
      return 'Invalid email or password.';
    }
    if (error.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (error.statusCode === 500) {
      return 'Server error. Please try again later.';
    }
    if (error.statusCode === 503) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    return 'An error occurred. Please try again.';
  }

  if (error instanceof AppError) {
    return error.message || 'An unexpected error occurred.';
  }

  if (error instanceof Error) {
    return 'An unexpected error occurred. Please try again.';
  }

  return 'An unknown error occurred.';
};

export default {
  generateErrorId,
  formatError,
  logError,
  sendErrorToService,
  AppError,
  ApiError,
  ValidationError,
  AuthError,
  asyncHandler,
  retryAsync,
  getUserFriendlyMessage,
};
