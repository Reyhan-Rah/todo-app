import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../store/todosSlice'
import TodoList from '../components/TodoList'

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

// Mock axios
jest.mock('@/lib/axios', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}))

describe('Todo App with Redux', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    )
  }

  describe('Todo List Rendering', () => {
    it('should render loading state initially', () => {
      renderWithProvider(<TodoList />)
      // Check for loading skeleton elements
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(5)
    })

    it('should render todo list when todos are loaded', async () => {
      const mockTodos = [
        {
          id: 1,
          todo: 'Test Todo 1',
          completed: false,
          userId: 1,
        },
        {
          id: 2,
          todo: 'Test Todo 2',
          completed: true,
          userId: 1,
        },
      ]

      // Mock the API response
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.getAll.mockResolvedValue(mockTodos)

      renderWithProvider(<TodoList />)

      // Wait for todos to load
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
      })
    })
  })

  describe('Redux Store', () => {
    it('should have initial state', () => {
      const state = store.getState()
      expect(state.todos.items).toEqual([])
      expect(state.todos.loading).toBe(false)
      expect(state.todos.error).toBe(null)
    })
  })
})
