import todosReducer, {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  setSearchTerm,
  setStatusFilter,
  clearFilters,
  reorderTodos,
  clearError,
  selectTodos,
  selectFilteredTodos,
  selectTodosLoading,
  selectTodosError,
  selectSearchTerm,
  selectStatusFilter,
  selectCompletedCount,
  selectIncompleteCount,
} from '../store/todosSlice'
import { Todo, CreateTodo, UpdateTodo } from '../services/api'

// Mock the API service
jest.mock('@/services/api', () => ({
  todoApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggle: jest.fn(),
  },
}))

describe('Todos Slice', () => {
  const mockTodos: Todo[] = [
    { id: 1, todo: 'First Todo', completed: false, userId: 1 },
    { id: 2, todo: 'Second Todo', completed: true, userId: 1 },
    { id: 3, todo: 'Third Todo', completed: false, userId: 1 },
  ]

  const mockCreateTodo: CreateTodo = {
    todo: 'New Todo',
    completed: false,
    userId: 1,
  }

  const mockUpdateTodo: UpdateTodo = {
    todo: 'Updated Todo',
    completed: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const initialState = todosReducer(undefined, { type: 'unknown' })
      
      expect(initialState).toEqual({
        items: [],
        filteredItems: [],
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      })
    })
  })

  describe('Fetch Todos', () => {
    it('should handle fetchTodos.pending', () => {
      const initialState = {
        items: [],
        filteredItems: [],
        loading: false,
        error: 'Previous error',
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, fetchTodos.pending('', undefined))

      expect(nextState.loading).toBe(true)
      expect(nextState.error).toBe(null)
    })

    it('should handle fetchTodos.fulfilled', () => {
      const initialState = {
        items: [],
        filteredItems: [],
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, fetchTodos.fulfilled(mockTodos, '', undefined))

      expect(nextState.loading).toBe(false)
      expect(nextState.items).toEqual(mockTodos)
      expect(nextState.filteredItems).toEqual(mockTodos)
    })

    it('should handle fetchTodos.rejected', () => {
      const initialState = {
        items: [],
        filteredItems: [],
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const errorMessage = 'Failed to fetch todos'
      const nextState = todosReducer(
        initialState,
        fetchTodos.rejected(new Error(errorMessage), '', undefined, errorMessage)
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.error).toBe(errorMessage)
    })
  })

  describe('Create Todo', () => {
    it('should handle createTodo.pending', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, createTodo.pending('', mockCreateTodo))

      expect(nextState.loading).toBe(true)
      expect(nextState.error).toBe(null)
    })

    it('should handle createTodo.fulfilled', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const newTodo: Todo = { id: 4, todo: 'New Todo', completed: false, userId: 1 }
      const nextState = todosReducer(initialState, createTodo.fulfilled(newTodo, '', mockCreateTodo))

      expect(nextState.loading).toBe(false)
      expect(nextState.items).toHaveLength(4)
      expect(nextState.items).toContain(newTodo)
      expect(nextState.filteredItems).toContain(newTodo)
    })

    it('should handle createTodo.rejected', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const errorMessage = 'Failed to create todo'
      const nextState = todosReducer(
        initialState,
        createTodo.rejected(new Error(errorMessage), '', mockCreateTodo, errorMessage)
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.error).toBe(errorMessage)
    })
  })

  describe('Update Todo', () => {
    it('should handle updateTodo.pending', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, updateTodo.pending('', { id: 1, data: mockUpdateTodo }))

      expect(nextState.loading).toBe(true)
      expect(nextState.error).toBe(null)
    })

    it('should handle updateTodo.fulfilled', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const updatedTodo: Todo = { ...mockTodos[0], todo: 'Updated Todo', completed: true }
      const nextState = todosReducer(
        initialState,
        updateTodo.fulfilled(updatedTodo, '', { id: 1, data: mockUpdateTodo })
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.items[0]).toEqual(updatedTodo)
      expect(nextState.filteredItems[0]).toEqual(updatedTodo)
    })

    it('should handle updateTodo.rejected', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const errorMessage = 'Failed to update todo'
      const nextState = todosReducer(
        initialState,
        updateTodo.rejected(new Error(errorMessage), '', { id: 1, data: mockUpdateTodo }, errorMessage)
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.error).toBe(errorMessage)
    })
  })

  describe('Delete Todo', () => {
    it('should handle deleteTodo.pending', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, deleteTodo.pending('', 1))

      expect(nextState.loading).toBe(true)
      expect(nextState.error).toBe(null)
    })

    it('should handle deleteTodo.fulfilled', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, deleteTodo.fulfilled(1, '', 1))

      expect(nextState.loading).toBe(false)
      expect(nextState.items).toHaveLength(2)
      expect(nextState.items.find(todo => todo.id === 1)).toBeUndefined()
      expect(nextState.filteredItems).toHaveLength(2)
    })

    it('should handle deleteTodo.rejected', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const errorMessage = 'Failed to delete todo'
      const nextState = todosReducer(
        initialState,
        deleteTodo.rejected(new Error(errorMessage), '', 1, errorMessage)
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.error).toBe(errorMessage)
    })
  })

  describe('Toggle Todo', () => {
    it('should handle toggleTodo.pending', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, toggleTodo.pending('', { id: 1, completed: true }))

      expect(nextState.loading).toBe(true)
      expect(nextState.error).toBe(null)
    })

    it('should handle toggleTodo.fulfilled', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const toggledTodo: Todo = { ...mockTodos[0], completed: true }
      const nextState = todosReducer(
        initialState,
        toggleTodo.fulfilled(toggledTodo, '', { id: 1, completed: true })
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.items[0].completed).toBe(true)
      expect(nextState.filteredItems[0].completed).toBe(true)
    })

    it('should handle toggleTodo.rejected', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: true,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const errorMessage = 'Failed to toggle todo'
      const nextState = todosReducer(
        initialState,
        toggleTodo.rejected(new Error(errorMessage), '', { id: 1, completed: true }, errorMessage)
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.error).toBe(errorMessage)
    })
  })

  describe('Filter Actions', () => {
    it('should handle setSearchTerm', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, setSearchTerm('First'))

      expect(nextState.searchTerm).toBe('First')
      expect(nextState.filteredItems).toHaveLength(1)
      expect(nextState.filteredItems[0].todo).toBe('First Todo')
    })

    it('should handle setStatusFilter for completed', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, setStatusFilter('completed'))

      expect(nextState.statusFilter).toBe('completed')
      expect(nextState.filteredItems).toHaveLength(1)
      expect(nextState.filteredItems[0].completed).toBe(true)
    })

    it('should handle setStatusFilter for incomplete', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, setStatusFilter('incomplete'))

      expect(nextState.statusFilter).toBe('incomplete')
      expect(nextState.filteredItems).toHaveLength(2)
      expect(nextState.filteredItems.every(todo => !todo.completed)).toBe(true)
    })

    it('should handle clearFilters', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: [mockTodos[0]],
        loading: false,
        error: null,
        searchTerm: 'First',
        statusFilter: 'incomplete' as const,
      }

      const nextState = todosReducer(initialState, clearFilters())

      expect(nextState.searchTerm).toBe('')
      expect(nextState.statusFilter).toBe('all')
      expect(nextState.filteredItems).toEqual(mockTodos)
    })
  })

  describe('Reorder Todos', () => {
    it('should handle reorderTodos', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const reorderedTodos = [mockTodos[2], mockTodos[0], mockTodos[1]]
      const nextState = todosReducer(initialState, reorderTodos(reorderedTodos))

      expect(nextState.items).toEqual(reorderedTodos)
      expect(nextState.filteredItems).toEqual(reorderedTodos)
    })

    it('should maintain filters when reordering', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: [mockTodos[0], mockTodos[2]], // Only incomplete todos
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'incomplete' as const,
      }

      const reorderedTodos = [mockTodos[2], mockTodos[0], mockTodos[1]]
      const nextState = todosReducer(initialState, reorderTodos(reorderedTodos))

      expect(nextState.items).toEqual(reorderedTodos)
      // Filtered items should still only show incomplete todos
      expect(nextState.filteredItems).toHaveLength(2)
      expect(nextState.filteredItems.every(todo => !todo.completed)).toBe(true)
    })
  })

  describe('Clear Error', () => {
    it('should handle clearError', () => {
      const initialState = {
        items: mockTodos,
        filteredItems: mockTodos,
        loading: false,
        error: 'Some error',
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, clearError())

      expect(nextState.error).toBe(null)
    })
  })

  describe('Selectors', () => {
    const mockState = {
      todos: {
        items: mockTodos,
        filteredItems: [mockTodos[0], mockTodos[2]],
        loading: true,
        error: 'Test error',
        searchTerm: 'First',
        statusFilter: 'incomplete' as const,
      },
    }

    it('should select todos', () => {
      const result = selectTodos(mockState)
      expect(result).toEqual(mockTodos)
    })

    it('should select filtered todos', () => {
      const result = selectFilteredTodos(mockState)
      expect(result).toEqual([mockTodos[0], mockTodos[2]])
    })

    it('should select loading state', () => {
      const result = selectTodosLoading(mockState)
      expect(result).toBe(true)
    })

    it('should select error state', () => {
      const result = selectTodosError(mockState)
      expect(result).toBe('Test error')
    })

    it('should select search term', () => {
      const result = selectSearchTerm(mockState)
      expect(result).toBe('First')
    })

    it('should select status filter', () => {
      const result = selectStatusFilter(mockState)
      expect(result).toBe('incomplete')
    })

    it('should select completed count', () => {
      const result = selectCompletedCount(mockState)
      expect(result).toBe(1)
    })

    it('should select incomplete count', () => {
      const result = selectIncompleteCount(mockState)
      expect(result).toBe(2)
    })
  })

  describe('Filter Logic', () => {
    it('should apply search filter correctly', () => {
      const todos = [
        { id: 1, todo: 'React Todo', completed: false, userId: 1 },
        { id: 2, todo: 'Vue Todo', completed: true, userId: 1 },
        { id: 3, todo: 'Angular Todo', completed: false, userId: 1 },
      ]

      const initialState = {
        items: todos,
        filteredItems: todos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, setSearchTerm('React'))

      expect(nextState.filteredItems).toHaveLength(1)
      expect(nextState.filteredItems[0].todo).toBe('React Todo')
    })

    it('should apply status filter correctly', () => {
      const todos = [
        { id: 1, todo: 'First Todo', completed: false, userId: 1 },
        { id: 2, todo: 'Second Todo', completed: true, userId: 1 },
        { id: 3, todo: 'Third Todo', completed: false, userId: 1 },
      ]

      const initialState = {
        items: todos,
        filteredItems: todos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      const nextState = todosReducer(initialState, setStatusFilter('completed'))

      expect(nextState.filteredItems).toHaveLength(1)
      expect(nextState.filteredItems[0].completed).toBe(true)
    })

    it('should apply both search and status filters', () => {
      const todos = [
        { id: 1, todo: 'React Todo', completed: false, userId: 1 },
        { id: 2, todo: 'Vue Todo', completed: true, userId: 1 },
        { id: 3, todo: 'Angular Todo', completed: false, userId: 1 },
      ]

      const initialState = {
        items: todos,
        filteredItems: todos,
        loading: false,
        error: null,
        searchTerm: '',
        statusFilter: 'all' as const,
      }

      // Apply search filter first
      let nextState = todosReducer(initialState, setSearchTerm('Todo'))
      // Then apply status filter
      nextState = todosReducer(nextState, setStatusFilter('completed'))

      expect(nextState.filteredItems).toHaveLength(1)
      expect(nextState.filteredItems[0].todo).toBe('Vue Todo')
      expect(nextState.filteredItems[0].completed).toBe(true)
    })
  })
})
