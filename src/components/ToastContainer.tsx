import { useCallback } from 'react';
import Toast from '@/components/Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
  const handleClose = useCallback(
    (id: string) => {
      onRemoveToast(id);
    },
    [onRemoveToast]
  );

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={handleClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
