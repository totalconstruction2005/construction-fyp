import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

interface ErrorAlertProps {
  /**
   * Type of alert
   * @default 'error'
   */
  type?: AlertType;

  /**
   * Alert title/heading
   */
  title?: string;

  /**
   * Alert message
   */
  message: string;

  /**
   * Auto-hide after milliseconds (0 = don't auto-hide)
   * @default 0
   */
  autoHide?: number;

  /**
   * Show close button
   * @default true
   */
  closeable?: boolean;

  /**
   * Callback when alert is closed
   */
  onClose?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Error ID for tracking
   */
  errorId?: string;

  /**
   * Show details button
   */
  showDetails?: boolean;

  /**
   * Error details to display
   */
  details?: string;
}

/**
 * Reusable Error/Alert Component
 * 
 * Displays alerts with different severity levels
 * 
 * @component
 * @example
 * <ErrorAlert
 *   type="error"
 *   title="Error"
 *   message="Failed to load data"
 *   autoHide={5000}
 *   onClose={() => handleClose()}
 * />
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  type = 'error',
  title,
  message,
  autoHide = 0,
  closeable = true,
  onClose,
  className = '',
  errorId,
  showDetails = false,
  details,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide && autoHide > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHide);

      return () => clearTimeout(timer);
    }
  }, [autoHide]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  // Style configuration by type
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      buttonColor: 'hover:bg-blue-100',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-700',
      buttonColor: 'hover:bg-amber-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      buttonColor: 'hover:bg-red-100',
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      titleColor: 'text-emerald-900',
      messageColor: 'text-emerald-700',
      buttonColor: 'hover:bg-emerald-100',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`
        ${style.bg} border ${style.border} rounded-lg p-4 mb-4
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">{style.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold ${style.titleColor} mb-1`}>
              {title}
            </h3>
          )}

          <p className={`${style.messageColor} text-sm`}>
            {message}
          </p>

          {/* Error ID */}
          {errorId && (
            <p className="text-xs opacity-75 mt-2 font-mono">
              ID: {errorId}
            </p>
          )}

          {/* Details */}
          {showDetails && details && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-semibold opacity-75 hover:opacity-100">
                Show Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto max-h-32 bg-white/50 p-2 rounded border border-current/20 whitespace-pre-wrap break-words">
                {details}
              </pre>
            </details>
          )}
        </div>

        {/* Close Button */}
        {closeable && (
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded transition
              ${style.buttonColor}
            `}
            aria-label="Close alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
