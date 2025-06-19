import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      // Progress bar animation
      const startTime = Date.now();
      const progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(progressTimer);
        }
      }, 50);

      // Auto close timer
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-l-green-500',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: <CheckCircle className="h-5 w-5" />,
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-l-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: <AlertCircle className="h-5 w-5" />,
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-l-yellow-500',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          icon: <AlertTriangle className="h-5 w-5" />,
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-yellow-500'
        };
      case 'info':
        return {
          bgColor: 'bg-white',
          borderColor: 'border-l-blue-500',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: <Info className="h-5 w-5" />,
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-blue-500'
        };
      default:
        return {
          bgColor: 'bg-white',
          borderColor: 'border-l-gray-500',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          icon: <Info className="h-5 w-5" />,
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-gray-500'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={`
        max-w-sm w-full ${config.bgColor} ${config.borderColor} border-l-4 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : isExiting 
            ? 'translate-x-full opacity-0 scale-95'
            : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2 mr-3`}>
            <div className={config.iconColor}>
              {config.icon}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.titleColor} leading-5`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${config.messageColor} leading-5`}>
                {message}
              </p>
            )}
          </div>
          
          {/* Close Button */}
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="h-1 bg-gray-100 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full transition-all ease-linear ${config.progressColor}`}
            style={{
              width: `${progress}%`,
              transition: 'width 50ms linear'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};

export default Toast; 