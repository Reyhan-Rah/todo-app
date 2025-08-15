import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoApi, Todo, CreateTodo, UpdateTodo } from '@/services/api'
import { handleApiError } from '@/services/api'

// Query keys for React Query
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
}

// Hook for fetching all todos
export const useTodos = () => {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: todoApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

// Hook for fetching a single todo
export const useTodo = (id: number) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getById(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for creating a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTodo) => todoApi.create(data),
    onSuccess: (newTodo) => {
      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
      
      // Optimistically update the cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old ? [...old, newTodo] : [newTodo]
      })
    },
    onError: (error) => {
      handleApiError(error)
    },
  })
}

// Hook for updating a todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodo }) =>
      todoApi.update(id, data),
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo)
      
      // Update the todo in the list cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old?.map(todo => 
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      })
    },
    onError: (error) => {
      handleApiError(error)
    },
  })
}

// Hook for deleting a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => todoApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(deletedId) })
      
      // Update the list cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old?.filter(todo => todo.id !== deletedId)
      })
    },
    onError: (error) => {
      handleApiError(error)
    },
  })
}

// Hook for toggling todo completion
export const useToggleTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      todoApi.toggle(id, completed),
    onSuccess: (updatedTodo) => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoKeys.detail(updatedTodo.id), updatedTodo)
      
      // Update the todo in the list cache
      queryClient.setQueryData(todoKeys.lists(), (old: Todo[] | undefined) => {
        return old?.map(todo => 
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      })
    },
    onError: (error) => {
      handleApiError(error)
    },
  })
}
