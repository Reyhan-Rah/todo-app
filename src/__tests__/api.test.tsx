import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodos, useCreateTodo } from '../hooks/useTodos';
import { todoApi } from '../services/api';
import { Todo } from '../services/api';

// Mock the API service
jest.mock('@/services/api', () => ({
  todoApi: {
    getAll: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock axios
jest.mock('@/lib/axios', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe('Todo API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTodos', () => {
    it('should fetch todos successfully', async () => {
      const mockTodos: Todo[] = [
        {
          id: 1,
          todo: 'Test Todo',
          completed: false,
          userId: 1,
        },
      ];

      const mockGetAll = todoApi.getAll as jest.MockedFunction<
        typeof todoApi.getAll
      >;
      mockGetAll.mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTodos);
      expect(mockGetAll).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching todos fails', async () => {
      const error = new Error('Failed to fetch todos');
      const mockGetAll = todoApi.getAll as jest.MockedFunction<
        typeof todoApi.getAll
      >;
      mockGetAll.mockRejectedValue(error);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCreateTodo', () => {
    it('should create todo successfully', async () => {
      const newTodo: Todo = {
        id: 2,
        todo: 'New Todo',
        completed: false,
        userId: 1,
      };

      const mockCreate = todoApi.create as jest.MockedFunction<
        typeof todoApi.create
      >;
      mockCreate.mockResolvedValue(newTodo);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      const createData = { todo: 'New Todo' };
      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newTodo);
      expect(mockCreate).toHaveBeenCalledWith(createData);
    });

    it('should handle error when creating todo fails', async () => {
      const error = new Error('Failed to create todo');
      const mockCreate = todoApi.create as jest.MockedFunction<
        typeof todoApi.create
      >;
      mockCreate.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      const createData = { todo: 'New Todo' };
      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
