import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi, Todo, CreateTodo, UpdateTodo } from '@/services/api';
import { handleApiError } from '@/services/api';
import { AxiosError } from 'axios';

// Toast context - this will be provided by the parent component
let toastContext: {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
} | null = null;

export const setToastContext = (context: typeof toastContext) => {
  toastContext = context;
};

// Query keys for React Query
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};

// Hook for fetching all todos
export const useTodos = () => {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: todoApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook for fetching a single todo
export const useTodo = (id: number) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getById(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodo) => todoApi.create(data),
    onSuccess: newTodo => {
      // Invalidate and refetch todos list in real application
      // queryClient.invalidateQueries({ queryKey: todoKeys.lists() })

      // Optimistically update the cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        const newTodoWithUniqueId = {
          ...newTodo,
          id: newTodo.id + Math.random().toString(36).substring(2, 11),
        };
        return old ? [newTodoWithUniqueId, ...old] : [newTodoWithUniqueId];
      });

      // Show success toast
      toastContext?.showSuccess('Todo created successfully!');
    },
    onError: error => {
      handleApiError(error);
      toastContext?.showError('Failed to create todo');
    },
  });
};

// Hook for updating a todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodo }) =>
      todoApi.update(id, data),
    onSuccess: updatedTodo => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);

      // Update the todo in the list cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old?.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
      });

      // Show success toast
      toastContext?.showSuccess('Todo updated successfully!');
    },
    onError: error => {
      handleApiError(error);
      toastContext?.showError('Failed to update todo');
    },
  });
};

// Hook for deleting a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(deletedId) });

      // Update the list cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old?.filter(todo => todo.id !== deletedId);
      });

      // Show success toast
      toastContext?.showSuccess('Todo deleted successfully!');
    },
    onError: (error, id) => {
      // Handle 404 errors by updating the cache optimistically
      if (error instanceof AxiosError && error.response?.status === 404) {
        queryClient.setQueryData(
          todoKeys.lists(),
          (old: Todo[] | undefined) => {
            return old?.filter(todo => todo.id !== id);
          }
        );
      }
      handleApiError(error);
      toastContext?.showError('Failed to delete todo');
    },
  });
};

// Hook for toggling todo completion
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      todoApi.toggle(id, completed),
    onSuccess: updatedTodo => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo);

      // Update the todo in the list cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old?.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
      });

      // Show success toast
      const status = updatedTodo.completed ? 'completed' : 'incomplete';
      toastContext?.showSuccess(`Todo marked as ${status}!`);
    },
    onError: (error, variables) => {
      // Handle 404 errors by updating the todo in the list cache optimistically
      if (error instanceof AxiosError && error.response?.status === 404) {
        // Get the id from the mutation variables
        const { id } = variables;
        queryClient.setQueryData(
          todoKeys.lists(),
          (old: Todo[] | undefined) => {
            return old?.map(todo =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            );
          }
        );
      }

      handleApiError(error);
      toastContext?.showError('Failed to update todo status');
    },
  });
};
