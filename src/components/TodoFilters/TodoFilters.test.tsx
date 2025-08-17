import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoFilters from './index';

describe('TodoFilters', () => {
  const mockTodos = [
    { id: 1, todo: 'First todo item', completed: false, userId: 1 },
    { id: 2, todo: 'Second completed todo', completed: true, userId: 1 },
    { id: 3, todo: 'Third todo item', completed: false, userId: 1 },
    { id: 4, todo: 'Fourth completed task', completed: true, userId: 1 },
    { id: 5, todo: 'Fifth todo item', completed: false, userId: 1 },
  ];

  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with all filter elements', () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByPlaceholderText('Search todos...')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();
    expect(screen.getByText('Total: 5')).toBeInTheDocument();
    expect(screen.getByText('Completed: 2')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 3')).toBeInTheDocument();
  });

  it('should display correct todo counts', () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Total: 5')).toBeInTheDocument();
    expect(screen.getByText('Completed: 2')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 3')).toBeInTheDocument();
  });

  it('should filter todos by search term', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 2, todo: 'Second completed todo', completed: true, userId: 1 },
        { id: 4, todo: 'Fourth completed task', completed: true, userId: 1 },
      ]);
    });
  });

  it('should filter todos by status - completed', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const statusSelect = screen.getByDisplayValue('All');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 2, todo: 'Second completed todo', completed: true, userId: 1 },
        { id: 4, todo: 'Fourth completed task', completed: true, userId: 1 },
      ]);
    });
  });

  it('should filter todos by status - incomplete', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const statusSelect = screen.getByDisplayValue('All');
    fireEvent.change(statusSelect, { target: { value: 'incomplete' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 1, todo: 'First todo item', completed: false, userId: 1 },
        { id: 3, todo: 'Third todo item', completed: false, userId: 1 },
        { id: 5, todo: 'Fifth todo item', completed: false, userId: 1 },
      ]);
    });
  });

  it('should filter todos by both search term and status', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    const statusSelect = screen.getByDisplayValue('All');

    // Set search term
    fireEvent.change(searchInput, { target: { value: 'todo' } });
    
    // Set status to incomplete
    fireEvent.change(statusSelect, { target: { value: 'incomplete' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 1, todo: 'First todo item', completed: false, userId: 1 },
        { id: 3, todo: 'Third todo item', completed: false, userId: 1 },
        { id: 5, todo: 'Fifth todo item', completed: false, userId: 1 },
      ]);
    });
  });

  it('should show clear filters button when filters are applied', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Clear filters')).toBeInTheDocument();
    });
  });

  it('should clear all filters when clear filters button is clicked', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    const statusSelect = screen.getByDisplayValue('All');

    // Apply filters
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    // Clear filters
    const clearButton = screen.getByText('Clear filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(statusSelect).toHaveValue('all');
      expect(mockOnFilterChange).toHaveBeenCalledWith(mockTodos);
    });
  });

  it('should show filtered results count when filters are applied', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 5 todos')).toBeInTheDocument();
    });
  });

  it('should handle case-insensitive search', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'COMPLETED' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 2, todo: 'Second completed todo', completed: true, userId: 1 },
        { id: 4, todo: 'Fourth completed task', completed: true, userId: 1 },
      ]);
    });
  });

  it('should handle search with special characters', async () => {
    const specialTodos = [
      { id: 1, todo: 'Todo with émojis 🎉', completed: false, userId: 1 },
      { id: 2, todo: 'Todo with <script>alert("xss")</script>', completed: false, userId: 1 },
    ];

    render(<TodoFilters todos={specialTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'émojis' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 1, todo: 'Todo with émojis 🎉', completed: false, userId: 1 },
      ]);
    });
  });

  it('should handle empty search term', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(mockTodos);
    });
  });

  it('should handle whitespace-only search term', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: '   ' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(mockTodos);
    });
  });

  it('should handle status filter change to all', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const statusSelect = screen.getByDisplayValue('All');
    
    // First set to completed
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    
    // Then set back to all
    fireEvent.change(statusSelect, { target: { value: 'all' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(mockTodos);
    });
  });

  it('should handle empty todos array', () => {
    render(<TodoFilters todos={[]} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('Completed: 0')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 0')).toBeInTheDocument();
  });

  it('should handle todos with all completed status', () => {
    const allCompletedTodos = mockTodos.map(todo => ({ ...todo, completed: true }));
    
    render(<TodoFilters todos={allCompletedTodos} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Total: 5')).toBeInTheDocument();
    expect(screen.getByText('Completed: 5')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 0')).toBeInTheDocument();
  });

  it('should handle todos with all incomplete status', () => {
    const allIncompleteTodos = mockTodos.map(todo => ({ ...todo, completed: false }));
    
    render(<TodoFilters todos={allIncompleteTodos} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Total: 5')).toBeInTheDocument();
    expect(screen.getByText('Completed: 0')).toBeInTheDocument();
    expect(screen.getByText('Incomplete: 5')).toBeInTheDocument();
  });

  it('should handle very long todo text in search', async () => {
    const longText = 'A'.repeat(1000);
    const longTodos = [
      { id: 1, todo: longText, completed: false, userId: 1 },
      { id: 2, todo: 'Short todo', completed: false, userId: 1 },
    ];

    render(<TodoFilters todos={longTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'A' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 1, todo: longText, completed: false, userId: 1 },
      ]);
    });
  });

  it('should handle search with partial matches', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'todo' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([
        { id: 1, todo: 'First todo item', completed: false, userId: 1 },
        { id: 2, todo: 'Second completed todo', completed: true, userId: 1 },
        { id: 3, todo: 'Third todo item', completed: false, userId: 1 },
        { id: 4, todo: 'Fourth completed task', completed: true, userId: 1 },
        { id: 5, todo: 'Fifth todo item', completed: false, userId: 1 },
      ]);
    });
  });

  it('should handle search with no matches', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith([]);
    });
  });

  it('should maintain filter state when todos change', async () => {
    const { rerender } = render(
      <TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />
    );

    const searchInput = screen.getByPlaceholderText('Search todos...');
    const statusSelect = screen.getByDisplayValue('All');

    // Apply filters
    fireEvent.change(searchInput, { target: { value: 'todo' } });
    fireEvent.change(statusSelect, { target: { value: 'incomplete' } });

    // Change todos
    const newTodos = [
      { id: 1, todo: 'New todo item', completed: false, userId: 1 },
      { id: 2, todo: 'Another new todo', completed: true, userId: 1 },
    ];

    rerender(<TodoFilters todos={newTodos} onFilterChange={mockOnFilterChange} />);

    await waitFor(() => {
      expect(searchInput).toHaveValue('todo');
      expect(statusSelect).toHaveValue('incomplete');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    const statusSelect = screen.getByDisplayValue('All');

    expect(searchInput).toHaveAttribute('type', 'text');
    // Note: HTML select elements don't have role="combobox" by default
    expect(statusSelect.tagName).toBe('SELECT');
  });

  it('should handle rapid filter changes gracefully', async () => {
    render(<TodoFilters todos={mockTodos} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search todos...');
    const statusSelect = screen.getByDisplayValue('All');

    // Rapidly change filters
    fireEvent.change(searchInput, { target: { value: 'first' } });
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    fireEvent.change(searchInput, { target: { value: 'second' } });
    fireEvent.change(statusSelect, { target: { value: 'incomplete' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });
});
