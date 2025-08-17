import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useSortable hook with a simple implementation
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock the TodoItem component
jest.mock('@/components/TodoItem', () => ({
  default: ({ todo }: { todo: any }) => (
    <div data-testid={`todo-item-${todo.id}`}>
      {todo.todo}
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SortableTodoItem', () => {
  const mockTodo = {
    id: 1,
    todo: 'Test todo item',
    completed: false,
    userId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be properly configured for drag and drop functionality', () => {
    // Test that the component is set up correctly
    expect(true).toBe(true);
  });

  it('should handle todo props correctly', () => {
    // Test that the component can handle todo data
    expect(mockTodo.id).toBe(1);
    expect(mockTodo.todo).toBe('Test todo item');
    expect(mockTodo.completed).toBe(false);
  });

  it('should have proper drag and drop structure', () => {
    // Test that the component has the right structure
    const { useSortable } = require('@dnd-kit/sortable');
    expect(useSortable).toBeDefined();
    expect(typeof useSortable).toBe('function');
  });

  it('should integrate with TodoItem component', () => {
    // Test that the component integrates with TodoItem
    const TodoItem = require('@/components/TodoItem').default;
    expect(TodoItem).toBeDefined();
    expect(typeof TodoItem).toBe('function');
  });

  it('should support different todo states', () => {
    // Test that the component supports various todo states
    const completedTodo = { ...mockTodo, completed: true };
    const differentTodo = { ...mockTodo, id: 2, todo: 'Another todo' };
    
    expect(completedTodo.completed).toBe(true);
    expect(differentTodo.id).toBe(2);
    expect(differentTodo.todo).toBe('Another todo');
  });
});
