import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  todoTitle: string
}

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, todoTitle }: DeleteConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-lg shadow-xl p-6"
        role="document"
      >
        <h2
          id="delete-modal-title"
          className="text-xl font-semibold text-gray-900 mb-2"
        >
          Delete Todo
        </h2>
        
        <p
          id="delete-modal-description"
          className="text-gray-600 mb-6"
        >
          Are you sure you want to delete &ldquo;{todoTitle}&rdquo;? This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-4 py-2 text-gray-700 bg-gray-100 rounded-lg",
              "hover:bg-gray-200 focus:outline-none focus:ring-2",
              "focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            )}
          >
            Cancel
          </button>
          
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-white bg-red-600 rounded-lg",
              "hover:bg-red-700 focus:outline-none focus:ring-2",
              "focus:ring-red-500 focus:ring-offset-2 transition-colors"
            )}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
