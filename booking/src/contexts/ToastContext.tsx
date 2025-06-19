import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { id, type, title, message, duration };
    
    setToasts(prev => {
      // Limit to maximum 5 toasts
      const updatedToasts = [...prev, newToast];
      if (updatedToasts.length > 5) {
        return updatedToasts.slice(-5);
      }
      return updatedToasts;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        <div className="space-y-3">
          {toasts.map((toast, index) => (
            <div 
              key={toast.id}
              className="pointer-events-auto"
              style={{
                transform: `translateY(${index * 4}px)`,
                zIndex: 1000 - index
              }}
            >
              <Toast
                id={toast.id}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                duration={toast.duration}
                onClose={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 