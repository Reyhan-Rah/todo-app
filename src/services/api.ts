import { apiService } from '@/lib/axios';
import { z } from 'zod';

// Define API response schemas with Zod based on DummyJSON structure
export const TodoSchema = z.object({
  id: z.number(),
  todo: z.string(),
  completed: z.boolean(),
  userId: z.number(),
});

export const TodosResponseSchema = z.object({
  todos: z.array(TodoSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export const CreateTodoSchema = z.object({
  todo: z.string().min(1, 'Todo text is required'),
  completed: z.boolean().optional(),
  userId: z.number().optional(),
});

export const UpdateTodoSchema = z.object({
  todo: z.string().min(1, 'Todo text is required').optional(),
  completed: z.boolean().optional(),
  userId: z.number().optional(),
});

// TypeScript types inferred from Zod schemas
export type Todo = z.infer<typeof TodoSchema>;
export type TodosResponse = z.infer<typeof TodosResponseSchema>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;

// API endpoints for DummyJSON
const API_ENDPOINTS = {
  todos: '/todos',
  addTodo: '/todos/add',
  todo: (id: number) => `/todos/${id}`,
} as const;

// Todo API service for DummyJSON
export const todoApi = {
  // Get all todos
  getAll: async (): Promise<Todo[]> => {
    const response = await apiService.get<TodosResponse>(API_ENDPOINTS.todos);
    const validatedResponse = TodosResponseSchema.parse(response);
    return validatedResponse.todos;
  },

  // Get single todo by ID
  getById: async (id: number): Promise<Todo> => {
    const response = await apiService.get<Todo>(API_ENDPOINTS.todo(id));
    return TodoSchema.parse(response);
  },

  // Create new todo
  create: async (data: CreateTodo): Promise<Todo> => {
    const validatedData = CreateTodoSchema.parse(data);
    const response = await apiService.post<Todo>(
      API_ENDPOINTS.addTodo,
      validatedData
    );
    return TodoSchema.parse(response);
  },

  // Update todo
  update: async (id: number, data: UpdateTodo): Promise<Todo> => {
    const validatedData = UpdateTodoSchema.parse(data);
    const response = await apiService.put<Todo>(
      API_ENDPOINTS.todo(id),
      validatedData
    );
    return TodoSchema.parse(response);
  },

  // Delete todo
  delete: async (id: number): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.todo(id));
  },

  // Toggle todo completion
  toggle: async (id: number, completed: boolean): Promise<Todo> => {
    const response = await apiService.patch<Todo>(API_ENDPOINTS.todo(id), {
      completed,
    });
    return TodoSchema.parse(response);
  },
};

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API error handler
export const handleApiError = (error: unknown): never => {
  // Type guard for axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; code?: string }; status: number };
    };
    // Server responded with error status
    throw new ApiError(
      axiosError.response?.data?.message || 'An error occurred',
      axiosError.response?.status || 0,
      axiosError.response?.data?.code
    );
  } else if (error && typeof error === 'object' && 'request' in error) {
    // Request was made but no response received
    throw new ApiError('Network error - no response received', 0);
  } else {
    // Something else happened
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new ApiError(errorMessage, 0);
  }
};
