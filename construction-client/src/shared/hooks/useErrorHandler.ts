import { useState, useCallback } from 'react';
import {
  logError,
  getUserFriendlyMessage,
  AppError,
  ApiError,
  ValidationError,
  AuthError,
  type ErrorLog,
} from '@shared/utils/errorHandler';

export interface UseErrorHandlerReturn {
  error: Error | null;
  errorMessage: string;
  isError: boolean;
  errorLog: ErrorLog | null;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, level?: 'info' | 'warning' | 'error' | 'critical') => void;
  throwError: (message: string, code?: string) => void;
  throwApiError: (message: string, statusCode?: number) => void;
  throwValidationError: (message: string, fields?: Record<string, string[]>) => void;
  throwAuthError: (message: string) => void;
}

/**
 * Custom hook for error handling
 * 
 * @param initialError - Initial error state
 * @returns Error handling utilities
 * 
 * @example
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await fetchData();
 * } catch (err) {
 *   handleError(err);
 * }
 */
export const useErrorHandler = (initialError?: Error | null): UseErrorHandlerReturn => {
  const [error, setError] = useState<Error | null>(initialError || null);
  const [errorLog, setErrorLog] = useState<ErrorLog | null>(null);

  const errorMessage = error ? getUserFriendlyMessage(error) : '';
  const isError = error !== null;

  const handleSetError = useCallback((err: Error | string | null) => {
    if (err === null) {
      setError(null);
      setErrorLog(null);
    } else if (typeof err === 'string') {
      const error = new Error(err);
      setError(error);
    } else {
      setError(err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorLog(null);
  }, []);

  const handleError = useCallback(
    (err: unknown, level: 'info' | 'warning' | 'error' | 'critical' = 'error') => {
      const formattedError = err instanceof Error ? err : new Error(String(err));
      setError(formattedError);

      const logged = logError(err, level);
      setErrorLog(logged);
    },
    []
  );

  const throwError = useCallback((message: string, code?: string) => {
    const appError = new AppError(message, code);
    setError(appError);
    const logged = logError(appError);
    setErrorLog(logged);
  }, []);

  const throwApiError = useCallback((message: string, statusCode?: number) => {
    const apiError = new ApiError(message, statusCode);
    setError(apiError);
    const logged = logError(apiError);
    setErrorLog(logged);
  }, []);

  const throwValidationError = useCallback(
    (message: string, fields?: Record<string, string[]>) => {
      const validationError = new ValidationError(message, fields);
      setError(validationError);
      const logged = logError(validationError);
      setErrorLog(logged);
    },
    []
  );

  const throwAuthError = useCallback((message: string) => {
    const authError = new AuthError(message);
    setError(authError);
    const logged = logError(authError);
    setErrorLog(logged);
  }, []);

  return {
    error,
    errorMessage,
    isError,
    errorLog,
    setError: handleSetError,
    clearError,
    handleError,
    throwError,
    throwApiError,
    throwValidationError,
    throwAuthError,
  };
};

export default useErrorHandler;
