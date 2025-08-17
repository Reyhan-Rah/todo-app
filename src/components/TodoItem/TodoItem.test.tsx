import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoItem from './index';
import { useDeleteTodo, useToggleTodo } from '@/hooks/useTodos';

// Mock the hooks
jest.mock('@/hooks/useTodos', () => ({
  useDeleteTodo: jest.fn(),
  useToggleTodo: jest.fn(),
}));

const mockUseDeleteTodo = useDeleteTodo as jest.MockedFunction<typeof useDeleteTodo>;
const mockUseToggleTodo = useToggleTodo as jest.MockedFunction<typeof useToggleTodo>;

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

const mockTodo = {
  id: 1,
  todo: 'Test todo item',
  completed: false,
  userId: 1,
};

describe('TodoItem', () => {
  const defaultMockDeleteMutation = {
    mutate: jest.fn(),
    isPending: false,
  } as any;

  const defaultMockToggleMutation = {
    mutate: jest.fn(),
    isPending: false,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeleteTodo.mockReturnValue(defaultMockDeleteMutation);
    mockUseToggleTodo.mockReturnValue(defaultMockToggleMutation);
  });

  it('should render correctly with incomplete todo', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    expect(screen.getByText('Test todo item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark as complete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete todo: Test todo item' })).toBeInTheDocument();
  });

  it('should render correctly with completed todo', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} />, { wrapper: createWrapper() });

    expect(screen.getByText('Test todo item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark as incomplete' })).toBeInTheDocument();
    expect(screen.getByText('Test todo item')).toHaveClass('line-through', 'text-gray-500');
  });

  it('should show delete modal when delete button is clicked', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test todo item' });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Todo')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it('should call delete mutation when delete is confirmed', async () => {
    const mockMutate = jest.fn();
    mockUseDeleteTodo.mockReturnValue({
      ...defaultMockDeleteMutation,
      mutate: mockMutate,
    } as any);

    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test todo item' });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(1);
    });
  });

  it('should close delete modal when delete is cancelled', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test todo item' });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Todo')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument();
  });

  it('should call toggle mutation when toggle button is clicked', async () => {
    const mockMutate = jest.fn();
    mockUseToggleTodo.mockReturnValue({
      ...defaultMockToggleMutation,
      mutate: mockMutate,
    } as any);

    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByRole('button', { name: 'Mark as complete' });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: 1, completed: true });
    });
  });

  it('should call toggle mutation when todo title is clicked', async () => {
    const mockMutate = jest.fn();
    mockUseToggleTodo.mockReturnValue({
      ...defaultMockToggleMutation,
      mutate: mockMutate,
    } as any);

    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const todoTitle = screen.getByText('Test todo item');
    fireEvent.click(todoTitle);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: 1, completed: true });
    });
  });

  it('should handle keyboard navigation for todo title', async () => {
    const mockMutate = jest.fn();
    mockUseToggleTodo.mockReturnValue({
      ...defaultMockToggleMutation,
      mutate: mockMutate,
    } as any);

    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const todoTitle = screen.getByText('Test todo item');
    
    // Test Enter key
    fireEvent.keyDown(todoTitle, { key: 'Enter' });
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: 1, completed: true });
    });

    // Test Space key
    fireEvent.keyDown(todoTitle, { key: ' ' });
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading state when toggle mutation is pending', () => {
    mockUseToggleTodo.mockReturnValue({
      ...defaultMockToggleMutation,
      isPending: true,
    } as any);

    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByRole('button', { name: 'Mark as complete' });
    expect(toggleButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show loading state when delete mutation is pending', () => {
    mockUseDeleteTodo.mockReturnValue({
      ...defaultMockDeleteMutation,
      isPending: true,
    } as any);

    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes for todo title', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const todoTitle = screen.getByText('Test todo item');
    expect(todoTitle).toHaveAttribute('role', 'button');
    expect(todoTitle).toHaveAttribute('tabIndex', '0');
    expect(todoTitle).toHaveAttribute('aria-label', 'Toggle todo: Test todo item');
  });

  it('should have proper accessibility attributes for toggle button', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByRole('button', { name: 'Mark as complete' });
    expect(toggleButton).toHaveAttribute('aria-label', 'Mark as complete');
  });

  it('should have proper accessibility attributes for delete button', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test todo item' });
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete todo: Test todo item');
  });

  it('should show checkmark icon when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByRole('button', { name: 'Mark as incomplete' });
    const checkmarkIcon = toggleButton.querySelector('svg');
    expect(checkmarkIcon).toBeInTheDocument();
  });

  it('should not show checkmark icon when todo is incomplete', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByRole('button', { name: 'Mark as complete' });
    const checkmarkIcon = toggleButton.querySelector('svg');
    expect(checkmarkIcon).not.toBeInTheDocument();
  });

  it('should apply correct styling for completed todo', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} />, { wrapper: createWrapper() });

    const todoContainer = screen.getByText('Test todo item').closest('div')?.parentElement;
    expect(todoContainer).toHaveClass('bg-gray-50');
  });

  it('should apply correct styling for incomplete todo', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const todoContainer = screen.getByText('Test todo item').closest('div')?.parentElement;
    expect(todoContainer).not.toHaveClass('bg-gray-50');
  });

  it('should handle escape key to close delete modal', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test todo item' });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Todo')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument();
  });

  it('should close delete modal when clicking outside', () => {
    render(<TodoItem todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test todo item' });
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Todo')).toBeInTheDocument();

    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);

    expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument();
  });
});
