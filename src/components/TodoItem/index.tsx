import { useState } from 'react';
import { Todo } from '@/services/api';
import { useDeleteTodo, useToggleTodo } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface TodoItemProps {
  todo: Todo;
}

const TodoItem = ({ todo }: TodoItemProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteTodoMutation = useDeleteTodo();
  const toggleTodoMutation = useToggleTodo();

  const handleToggleTodo = () => {
    toggleTodoMutation.mutate({ id: todo.id, completed: !todo.completed });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    deleteTodoMutation.mutate(todo.id);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm',
          'transition-all duration-200 hover:shadow-md',
          todo.completed && 'bg-gray-50'
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <button
            type="button"
            onClick={handleToggleTodo}
            disabled={toggleTodoMutation.isPending}
            className={cn(
              'w-5 h-5 rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
              todo.completed
                ? 'bg-blue-500 border-blue-500 focus:ring-blue-500'
                : 'border-gray-300 focus:ring-blue-500 hover:border-blue-400',
              toggleTodoMutation.isPending && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={
              todo.completed ? 'Mark as incomplete' : 'Mark as complete'
            }
          >
            {todo.completed && (
              <svg
                className="w-3 h-3 text-white mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <span
            className={cn(
              'text-lg transition-all duration-200 cursor-pointer select-none',
              'hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1',
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            )}
            onClick={handleToggleTodo}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleTodo();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Toggle todo: ${todo.todo}`}
          >
            {todo.todo}
          </span>
        </div>

        <button
          onClick={handleDeleteClick}
          disabled={deleteTodoMutation.isPending}
          className={cn(
            'px-3 py-1 text-red-500 hover:text-red-700 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={`Delete todo: ${todo.todo}`}
        >
          {deleteTodoMutation.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        todoTitle={todo.todo}
      />
    </>
  );
};

export default TodoItem;
