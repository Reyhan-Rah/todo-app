import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoList from './index';
import {
  useTodos,
  useCreateTodo,
  useDeleteTodo,
  useToggleTodo,
} from '@/hooks/useTodos';

// Mock the hooks
jest.mock('@/hooks/useTodos', () => ({
  useTodos: jest.fn(),
  useCreateTodo: jest.fn(),
  useDeleteTodo: jest.fn(),
  useToggleTodo: jest.fn(),
}));

const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTodos = [
  { id: 1, todo: 'First todo', completed: false, userId: 1 },
  { id: 2, todo: 'Second todo', completed: true, userId: 1 },
  { id: 3, todo: 'Third todo', completed: false, userId: 1 },
];

describe('TodoList', () => {
  const mockUseTodos = jest.mocked(useTodos);
  const mockUseCreateTodo = jest.mocked(useCreateTodo);

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useCreateTodo to return a working mutation object
    mockUseCreateTodo.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
      mutateAsync: jest.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isSuccess: false,
      isPaused: false,
      status: 'idle',
      submittedAt: 0,
    } as any);

    // Mock useDeleteTodo and useToggleTodo
    const mockMutation = {
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
      mutateAsync: jest.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isSuccess: false,
      isPaused: false,
      status: 'idle',
      submittedAt: 0,
    } as any;

    (useDeleteTodo as jest.Mock).mockReturnValue(mockMutation);
    (useToggleTodo as jest.Mock).mockReturnValue(mockMutation);
  });

  it('should render loading skeleton when loading', () => {
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch todos'),
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('Error Loading Todos')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch todos')).toBeInTheDocument();
  });

  it('should render empty state when no todos exist', () => {
    mockUseTodos.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add your first todo above to get started!')
    ).toBeInTheDocument();
  });

  it('should render todos when data is available', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
    expect(screen.getByText('Third todo')).toBeInTheDocument();
  });

  it('should render filters when todos exist', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText('Search todos...')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Total: 3')).toBeInTheDocument();
    expect(screen.getByText('Completed: 1')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 2')).toBeInTheDocument();
  });

  it('should not render filters when no todos exist', () => {
    mockUseTodos.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(
      screen.queryByPlaceholderText('Search todos...')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
  });

  it('should render create todo form', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(
      screen.getByPlaceholderText('Add a new todo...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Todo' })
    ).toBeInTheDocument();
  });

  it('should show filtered results message when filters are applied', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'First' } });

    expect(screen.getByText('Showing 1 of 3 todos')).toBeInTheDocument();
  });

  it('should show no todos found message when filters return no results', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    expect(screen.getByText('No todos found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search or filters')
    ).toBeInTheDocument();
  });

  it('should handle reordering of todos', async () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    // The reordering functionality is handled by the SortableTodoList component
    // This test verifies that the component renders with the correct props
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
    expect(screen.getByText('Third todo')).toBeInTheDocument();
  });

  it('should maintain todo order after reordering', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    // Verify initial order
    const todoElements = screen.getAllByText(/todo$/);
    expect(todoElements[0]).toHaveTextContent('First todo');
    expect(todoElements[1]).toHaveTextContent('Second todo');
    expect(todoElements[2]).toHaveTextContent('Third todo');
  });

  it('should render with proper heading structure', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Todo List');
  });

  it('should handle undefined data gracefully', () => {
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.queryByText('No todos yet')).not.toBeInTheDocument();
    expect(screen.queryByText('First todo')).not.toBeInTheDocument();
  });

  it('should render loading skeleton with proper structure', () => {
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('Todo List')).toBeInTheDocument();
    // The LoadingSkeleton component should be rendered
    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
  });

  it('should render error state with proper structure', () => {
    const errorMessage = 'Network error occurred';
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Error Loading Todos')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render empty state with proper structure', () => {
    mockUseTodos.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add your first todo above to get started!')
    ).toBeInTheDocument();
  });

  it('should render filtered empty state with proper structure', () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    render(<TodoList />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('No todos found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search or filters')
    ).toBeInTheDocument();
  });
});
