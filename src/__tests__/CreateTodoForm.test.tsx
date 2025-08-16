import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../store/todosSlice'
import CreateTodoForm from '../components/CreateTodoForm'
import { CreateTodo } from '../services/api'

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
    create: jest.fn(),
  },
  CreateTodoSchema: {
    parse: jest.fn(),
  },
}))

describe('CreateTodoForm', () => {
  let store: ReturnType<typeof createTestStore>
  let user: ReturnType<typeof userEvent.setup>

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

  describe('Form Rendering', () => {
    it('should render the form with input and submit button', () => {
      renderWithProvider(<CreateTodoForm />)
      
      expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('Input Validation', () => {
    it('should prevent submission of empty input', async () => {
      renderWithProvider(<CreateTodoForm />)
      
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })
      expect(submitButton).toBeDisabled()
      
      // Try to submit empty form
      await user.click(submitButton)
      
      // The button should remain disabled and no validation error should appear
      expect(submitButton).toBeDisabled()
      expect(screen.queryByText('Todo title cannot be empty')).not.toBeInTheDocument()
    })

    it('should prevent submission of whitespace-only input', async () => {
      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      await user.type(input, '   ')
      
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })
      expect(submitButton).toBeDisabled()
      
      // Try to submit whitespace-only input
      await user.click(submitButton)
      
      // The button should remain disabled and no validation error should appear
      expect(submitButton).toBeDisabled()
      expect(screen.queryByText('Todo title cannot be empty')).not.toBeInTheDocument()
    })

    it('should enable submit button when input has valid content', async () => {
      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })
      
      // Initially disabled
      expect(submitButton).toBeDisabled()
      
      // Type valid content
      await user.type(input, 'New todo')
      expect(submitButton).toBeEnabled()
      
      // Clear and type whitespace
      await user.clear(input)
      await user.type(input, '   ')
      expect(submitButton).toBeDisabled()
      
      // Type valid content again
      await user.clear(input)
      await user.type(input, 'Valid todo')
      expect(submitButton).toBeEnabled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid input', async () => {
      const { CreateTodoSchema } = jest.requireMock('@/services/api')
      const mockValidatedData = {
        todo: 'New Todo Item',
        completed: false,
        userId: 1,
      }
      CreateTodoSchema.parse.mockReturnValue(mockValidatedData)

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.create.mockResolvedValue({
        id: 1,
        ...mockValidatedData,
      })

      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })

      await user.type(input, 'New Todo Item')
      await user.click(submitButton)

      await waitFor(() => {
        expect(CreateTodoSchema.parse).toHaveBeenCalledWith({
          todo: 'New Todo Item',
          completed: false,
          userId: 1,
        })
      })
    })

    it('should clear input after successful submission', async () => {
      const { CreateTodoSchema } = jest.requireMock('@/services/api')
      const mockValidatedData = {
        todo: 'New Todo Item',
        completed: false,
        userId: 1,
      }
      CreateTodoSchema.parse.mockReturnValue(mockValidatedData)

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.create.mockResolvedValue({
        id: 1,
        ...mockValidatedData,
      })

      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })

      await user.type(input, 'New Todo Item')
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should handle API errors gracefully', async () => {
      const { CreateTodoSchema } = jest.requireMock('@/services/api')
      const mockValidatedData = {
        todo: 'New Todo Item',
        completed: false,
        userId: 1,
      }
      CreateTodoSchema.parse.mockReturnValue(mockValidatedData)

      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.create.mockRejectedValue(new Error('API Error'))

      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })

      await user.type(input, 'New Todo Item')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })
    })
  })

  describe('Button States', () => {
    it('should disable submit button when input is empty', () => {
      renderWithProvider(<CreateTodoForm />)
      
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when input has content', async () => {
      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })

      await user.type(input, 'New Todo')
      expect(submitButton).toBeEnabled()
    })

    it('should show loading state during submission', async () => {
      const { CreateTodoSchema } = jest.requireMock('@/services/api')
      const mockValidatedData = {
        todo: 'New Todo Item',
        completed: false,
        userId: 1,
      }
      CreateTodoSchema.parse.mockReturnValue(mockValidatedData)

      const { todoApi } = jest.requireMock('@/services/api')
      // Create a promise that never resolves to simulate loading
      todoApi.create.mockReturnValue(new Promise(() => {}))

      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })

      await user.type(input, 'New Todo Item')
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: 'Adding...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled()
    })
  })

  describe('User Experience', () => {
    it('should handle Enter key submission', async () => {
      const { CreateTodoSchema } = jest.requireMock('@/services/api')
      const mockValidatedData = {
        todo: 'New Todo Item',
        completed: false,
        userId: 1,
      }
      CreateTodoSchema.parse.mockReturnValue(mockValidatedData)

      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      await user.type(input, 'New Todo Item')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(CreateTodoSchema.parse).toHaveBeenCalled()
      })
    })

    it('should trim whitespace from input before validation', async () => {
      const { CreateTodoSchema } = jest.requireMock('@/services/api')
      CreateTodoSchema.parse.mockImplementation((data: CreateTodo) => {
        expect(data.todo).toBe('New Todo Item') // Should be trimmed
        return data
      })

      renderWithProvider(<CreateTodoForm />)
      
      const input = screen.getByPlaceholderText('Add a new todo...')
      const submitButton = screen.getByRole('button', { name: 'Add Todo' })

      await user.type(input, '   New Todo Item   ')
      await user.click(submitButton)

      await waitFor(() => {
        expect(CreateTodoSchema.parse).toHaveBeenCalledWith({
          todo: 'New Todo Item',
          completed: false,
          userId: 1,
        })
      })
    })
  })
})
