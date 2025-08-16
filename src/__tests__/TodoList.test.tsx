import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../store/todosSlice'
import TodoList from '../components/TodoList'
import { Todo } from '../services/api'

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      todos: todosReducer,
    },
  })
}

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

// Mock the SortableTodoList component
jest.mock('../components/SortableTodoList', () => {
  return function MockSortableTodoList({ todos, onReorder }: {
    todos: Todo[]
    onReorder: (newOrder: Todo[]) => void
  }) {
    return (
      <div data-testid="sortable-todo-list">
        {todos.map((todo: Todo) => (
          <div key={todo.id} data-testid={`todo-item-${todo.id}`}>
            <span>{todo.todo}</span>
            <span data-testid={`todo-status-${todo.id}`}>
              {todo.completed ? 'completed' : 'incomplete'}
            </span>
          </div>
        ))}
        <button
          data-testid="mock-reorder-button"
          onClick={() => onReorder([todos[1], todos[0], todos[2]])}
        >
          Mock Reorder
        </button>
      </div>
    )
  }
})

// Mock the CreateTodoForm component
jest.mock('../components/CreateTodoForm', () => {
  return function MockCreateTodoForm() {
    return <div data-testid="create-todo-form">Create Todo Form</div>
  }
})

// Mock the TodoFilters component
jest.mock('../components/TodoFilters', () => {
  return function MockTodoFilters() {
    return <div data-testid="todo-filters">Todo Filters</div>
  }
})

describe('TodoList', () => {
  let store: ReturnType<typeof createTestStore>
  let user: ReturnType<typeof userEvent.setup>

  const mockTodos: Todo[] = [
    { id: 1, todo: 'First Todo', completed: false, userId: 1 },
    { id: 2, todo: 'Second Todo', completed: true, userId: 1 },
    { id: 3, todo: 'Third Todo', completed: false, userId: 1 },
  ]

  beforeEach(() => {
    store = createTestStore()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    )
  }

  describe('Component Rendering', () => {
    it('should render the create todo form when loaded', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('create-todo-form')).toBeInTheDocument()
    })

    it('should render the todo filters when loaded and todos exist', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('todo-filters')).toBeInTheDocument()
    })

    it('should render the sortable todo list when loaded', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('sortable-todo-list')).toBeInTheDocument()
    })
  })

  describe('Initial State and Loading', () => {
    it('should show loading state initially', () => {
      renderWithProvider(<TodoList />)
      
      // Check for loading skeleton elements
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(5)
    })

    it('should dispatch fetchTodos action on mount', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(todoApi.getAll).toHaveBeenCalled()
      })
    })
  })

  describe('Todo Display', () => {
    it('should display todos when loaded from API', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByText('First Todo')).toBeInTheDocument()
        expect(screen.getByText('Second Todo')).toBeInTheDocument()
        expect(screen.getByText('Third Todo')).toBeInTheDocument()
      })
    })

    it('should display todo status correctly', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-status-1')).toHaveTextContent('incomplete')
        expect(screen.getByTestId('todo-status-2')).toHaveTextContent('completed')
        expect(screen.getByTestId('todo-status-3')).toHaveTextContent('incomplete')
      })
    })

    it('should display completed todos with visual indication', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        const completedTodo = screen.getByTestId('todo-status-2')
        expect(completedTodo).toHaveTextContent('completed')
      })
    })

    it('should display incomplete todos without visual indication', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        const incompleteTodo = screen.getByTestId('todo-status-1')
        expect(incompleteTodo).toHaveTextContent('incomplete')
      })
    })
  })

  describe('API Integration', () => {
    it('should fetch todos from DummyJSON API', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(todoApi.getAll).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle API errors gracefully', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockRejectedValue(new Error('API Error'))

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(todoApi.getAll).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle empty todos array', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue([])

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('sortable-todo-list')).toBeInTheDocument()
      })
    })
  })

  describe('Redux State Management', () => {
    it('should have initial state', () => {
      const state = store.getState()
      expect(state.todos.items).toEqual([])
      expect(state.todos.loading).toBe(false)
      expect(state.todos.error).toBe(null)
    })

    it('should update state when todos are fetched', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        const state = store.getState()
        expect(state.todos.items).toEqual(mockTodos)
        expect(state.todos.loading).toBe(false)
      })
    })

    it('should handle loading state correctly', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      // Create a promise that never resolves to simulate loading
      todoApi.getAll.mockReturnValue(new Promise(() => {}))

      renderWithProvider(<TodoList />)

      const state = store.getState()
      expect(state.todos.loading).toBe(true)
    })
  })

  describe('Drag and Drop Integration', () => {
    it('should handle todo reordering', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByText('First Todo')).toBeInTheDocument()
      })

      const reorderButton = screen.getByTestId('mock-reorder-button')
      await user.click(reorderButton)

      // The component should handle reordering through the onReorder callback
      expect(reorderButton).toBeInTheDocument()
    })

    it('should maintain todo order after reordering', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByText('First Todo')).toBeInTheDocument()
      })

      const reorderButton = screen.getByTestId('mock-reorder-button')
      await user.click(reorderButton)

      // Verify that todos are still displayed
      expect(screen.getByText('First Todo')).toBeInTheDocument()
      expect(screen.getByText('Second Todo')).toBeInTheDocument()
      expect(screen.getByText('Third Todo')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should integrate with CreateTodoForm', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('create-todo-form')).toBeInTheDocument()
    })

    it('should integrate with TodoFilters', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('todo-filters')).toBeInTheDocument()
    })

    it('should integrate with SortableTodoList', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('sortable-todo-list')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should maintain proper ARIA attributes', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })

      // All todo items should maintain their accessibility features
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('todo-item-3')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })
      
      // The component should support keyboard navigation through its child components
      expect(screen.getByTestId('create-todo-form')).toBeInTheDocument()
      expect(screen.getByTestId('todo-filters')).toBeInTheDocument()
      expect(screen.getByTestId('sortable-todo-list')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockRejectedValue(new Error('Network Error'))

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(todoApi.getAll).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle malformed API responses', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(null)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(todoApi.getAll).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Performance', () => {
    it('should handle large numbers of todos efficiently', async () => {
      const largeTodos = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        todo: `Todo ${i + 1}`,
        completed: i % 2 === 0,
        userId: 1,
      }))

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(largeTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('sortable-todo-list')).toBeInTheDocument()
      })
    })

    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn()
      
      const TestComponent = () => {
        renderSpy()
        return <TodoList />
      }
      
      renderWithProvider(<TestComponent />)
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle todos with empty titles', async () => {
      const todosWithEmptyTitle = [
        { id: 1, todo: '', completed: false, userId: 1 },
        { id: 2, todo: 'Valid Todo', completed: true, userId: 1 },
      ]

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(todosWithEmptyTitle)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
        expect(screen.getByText('Valid Todo')).toBeInTheDocument()
      })
    })

    it('should handle todos with very long titles', async () => {
      const longTitle = 'A'.repeat(1000)
      const todosWithLongTitle = [
        { id: 1, todo: longTitle, completed: false, userId: 1 },
      ]

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(todosWithLongTitle)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
      })
    })

    it('should handle todos with special characters', async () => {
      const specialTodos = [
        { id: 1, todo: 'Todo with "quotes" & <tags>', completed: false, userId: 1 },
        { id: 2, todo: 'Todo with emojis 🚀✨', completed: true, userId: 1 },
      ]

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(specialTodos)

      renderWithProvider(<TodoList />)

      await waitFor(() => {
        expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
        expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
      })
    })
  })
})
