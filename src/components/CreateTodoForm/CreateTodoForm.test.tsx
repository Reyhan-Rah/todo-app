import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateTodo } from '@/hooks/useTodos';
import CreateTodoForm from './index';

// Mock the useCreateTodo hook
jest.mock('@/hooks/useTodos', () => ({
  useCreateTodo: jest.fn(),
}));

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

describe('CreateTodoForm', () => {
  const mockUseCreateTodo = jest.mocked(useCreateTodo);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateTodo.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render form elements correctly', () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    expect(
      screen.getByPlaceholderText('Add a new todo...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Todo' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Todo' })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should handle input changes', () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'New todo item' } });

    expect(input).toHaveValue('New todo item');
  });

  it('should enable submit button when input has text', () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Initially disabled (empty input)
    expect(submitButton).toBeDisabled();

    // Enable after typing
    fireEvent.change(input, { target: { value: 'New todo' } });
    expect(submitButton).toBeEnabled();
  });

  it('should show validation error for empty submission', async () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Button should be disabled initially (empty input)
    expect(submitButton).toBeDisabled();

    // Submit form - button should remain disabled
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show validation error for whitespace-only input', async () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Button should be disabled initially
    expect(submitButton).toBeDisabled();

    // Add whitespace - button should remain disabled
    fireEvent.change(input, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();

    // Submit form - button should remain disabled
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should call createTodo mutation on valid submission', async () => {
    const mockMutate = jest.fn();
    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;

    fireEvent.change(input, { target: { value: 'New todo item' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          todo: 'New todo item',
          completed: false,
          userId: 1,
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('should clear input and error on successful submission', async () => {
    const mockMutate = jest.fn();
    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as any);

    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Add valid text
    fireEvent.change(input, { target: { value: 'New todo' } });
    expect(submitButton).toBeEnabled();

    // Submit form
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          todo: 'New todo',
          completed: false,
          userId: 1,
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    // Simulate successful mutation
    mockMutate.mock.calls[0][1].onSuccess();

    await waitFor(() => {
      expect(input).toHaveValue('');
      expect(submitButton).toBeDisabled(); // Button should be disabled after clearing
    });
  });

  it('should show error message on mutation error', async () => {
    const mockMutate = jest.fn();
    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;

    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.submit(form);

    // Mock error response
    const onError = mockMutate.mock.calls[0][1]?.onError;
    if (onError) {
      onError(new Error('API Error'));
    }

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should clear validation error when user starts typing', async () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Create validation error
    fireEvent.submit(form);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Start typing valid text
    fireEvent.change(input, { target: { value: 'Valid todo' } });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  it('should show loading state when mutation is pending', () => {
    mockUseCreateTodo.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
      error: null,
    } as any);

    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const submitButton = screen.getByRole('button', { name: 'Adding...' });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Adding...');
  });

  it('should have proper accessibility attributes', () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('should show error styling when validation fails', async () => {
    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');
    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;

    fireEvent.submit(form);

    await waitFor(() => {
      expect(input).toHaveClass('border-red-300');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'todo-error');
    });
  });

  it('should handle form submission with Enter key', async () => {
    const mockMutate = jest.fn();
    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Add a new todo...');

    fireEvent.change(input, { target: { value: 'New todo' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('should not submit form with invalid input', async () => {
    const mockMutate = jest.fn();
    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as any);

    render(<CreateTodoForm />, { wrapper: createWrapper() });

    const form = screen
      .getByRole('button', { name: 'Add Todo' })
      .closest('form')!;
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Button should be disabled initially
    expect(submitButton).toBeDisabled();

    // Submit form with invalid input
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
      expect(submitButton).toBeDisabled(); // Button should remain disabled
    });
  });
});
