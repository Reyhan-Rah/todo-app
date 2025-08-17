import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  todoTitle: string;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  todoTitle,
}: DeleteConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      confirmButtonRef.current?.focus();
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'bg-black/30 backdrop-blur-sm'
          : 'bg-black/0 backdrop-blur-none'
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div
        ref={modalRef}
        className={cn(
          'w-full max-w-md bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-6',
          'transform transition-all duration-300 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        role="document"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2
            id="delete-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            Delete Todo
          </h2>
        </div>

        <p
          id="delete-modal-description"
          className="text-gray-600 mb-6 leading-relaxed"
        >
          Are you sure you want to delete &ldquo;{todoTitle}&rdquo;? This action
          cannot be undone.
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium',
              'hover:bg-gray-200 focus:outline-none focus:ring-2',
              'focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
              'hover:shadow-md active:scale-95'
            )}
          >
            Cancel
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              'px-6 py-2.5 text-white bg-red-600 rounded-lg font-medium',
              'hover:bg-red-700 focus:outline-none focus:ring-2',
              'focus:ring-red-500 focus:ring-offset-2 transition-all duration-200',
              'hover:shadow-md active:scale-95'
            )}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
