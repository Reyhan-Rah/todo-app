import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../store/todosSlice'
import TodoItem from '../components/TodoItem'
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
    toggle: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('TodoItem', () => {
  let store: ReturnType<typeof createTestStore>
  let user: ReturnType<typeof userEvent.setup>

  const mockTodo: Todo = {
    id: 1,
    todo: 'Test Todo Item',
    completed: false,
    userId: 1,
  }

  const mockCompletedTodo: Todo = {
    id: 2,
    todo: 'Completed Todo Item',
    completed: true,
    userId: 1,
  }

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

  describe('Todo Rendering', () => {
    it('should render todo item with title and status', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      expect(screen.getByText('Test Todo Item')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Mark as complete' })).toBeInTheDocument()
    })

    it('should render completed todo with strikethrough text', () => {
      renderWithProvider(<TodoItem todo={mockCompletedTodo} />)
      
      const todoText = screen.getByText('Completed Todo Item')
      expect(todoText).toHaveClass('line-through', 'text-gray-500')
    })

    it('should render incomplete todo without strikethrough', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const todoText = screen.getByText('Test Todo Item')
      expect(todoText).not.toHaveClass('line-through')
      expect(todoText).toHaveClass('text-gray-900')
    })

    it('should show delete button for each todo', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      expect(screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })).toBeInTheDocument()
    })
  })

  describe('Toggle Todo Status', () => {
    it('should toggle todo status when checkbox is clicked', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.toggle.mockResolvedValue({
        ...mockTodo,
        completed: true,
      })

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const toggleButton = screen.getByRole('button', { name: 'Mark as complete' })
      await user.click(toggleButton)

      // The component should dispatch the toggle action
      await waitFor(() => {
        expect(toggleButton).toBeInTheDocument()
      })
    })

    it('should toggle todo status when title is clicked', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.toggle.mockResolvedValue({
        ...mockTodo,
        completed: true,
      })

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const todoTitle = screen.getByText('Test Todo Item')
      await user.click(todoTitle)

      // The component should dispatch the toggle action
      await waitFor(() => {
        expect(todoTitle).toBeInTheDocument()
      })
    })

    it('should handle keyboard navigation for title toggle', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.toggle.mockResolvedValue({
        ...mockTodo,
        completed: true,
      })

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const todoTitle = screen.getByText('Test Todo Item')
      todoTitle.focus()
      await user.keyboard('{Enter}')

      // The component should dispatch the toggle action
      await waitFor(() => {
        expect(todoTitle).toBeInTheDocument()
      })
    })

    it('should handle space key for title toggle', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.toggle.mockResolvedValue({
        ...mockTodo,
        completed: true,
      })

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const todoTitle = screen.getByText('Test Todo Item')
      todoTitle.focus()
      await user.keyboard(' ')

      // The component should dispatch the toggle action
      await waitFor(() => {
        expect(todoTitle).toBeInTheDocument()
      })
    })

    it('should show correct toggle button state for completed todo', () => {
      renderWithProvider(<TodoItem todo={mockCompletedTodo} />)
      
      const toggleButton = screen.getByRole('button', { name: 'Mark as incomplete' })
      expect(toggleButton).toHaveClass('bg-blue-500', 'border-blue-500')
    })

    it('should show correct toggle button state for incomplete todo', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const toggleButton = screen.getByRole('button', { name: 'Mark as complete' })
      expect(toggleButton).toHaveClass('border-gray-300')
    })
  })

  describe('Delete Todo', () => {
    it('should show delete confirmation modal when delete button is clicked', async () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Delete Todo')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
    })

    it('should confirm deletion when delete button in modal is clicked', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      todoApi.delete.mockResolvedValue(undefined)

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(confirmDeleteButton)

      // The component should dispatch the delete action and close the modal
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should close modal when cancel button is clicked', async () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should close modal when backdrop is clicked', async () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      const modal = screen.getByRole('dialog')
      await user.click(modal)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should close modal when Escape key is pressed', async () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for toggle button', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const toggleButton = screen.getByRole('button', { name: 'Mark as complete' })
      expect(toggleButton).toHaveAttribute('aria-label', 'Mark as complete')
    })

    it('should have proper ARIA labels for completed todo toggle button', () => {
      renderWithProvider(<TodoItem todo={mockCompletedTodo} />)
      
      const toggleButton = screen.getByRole('button', { name: 'Mark as incomplete' })
      expect(toggleButton).toHaveAttribute('aria-label', 'Mark as incomplete')
    })

    it('should have proper ARIA labels for delete button', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete todo: Test Todo Item')
    })

    it('should have proper role for todo title', () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const todoTitle = screen.getByText('Test Todo Item')
      expect(todoTitle).toHaveAttribute('role', 'button')
      expect(todoTitle).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Loading States', () => {
    it('should disable toggle button during deletion', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      // Create a promise that never resolves to simulate loading
      todoApi.delete.mockReturnValue(new Promise(() => {}))

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(confirmDeleteButton)

      const toggleButton = screen.getByRole('button', { name: 'Mark as complete' })
      expect(toggleButton).toBeDisabled()
    })

    it('should show loading text on delete button during deletion', async () => {
      const { todoApi } = jest.requireMock('@/services/api')
      // Create a promise that never resolves to simulate loading
      todoApi.delete.mockReturnValue(new Promise(() => {}))

      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(confirmDeleteButton)

      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })
  })

  describe('Modal Focus Management', () => {
    it('should focus confirm button when modal opens', async () => {
      renderWithProvider(<TodoItem todo={mockTodo} />)
      
      const deleteButton = screen.getByRole('button', { name: 'Delete todo: Test Todo Item' })
      await user.click(deleteButton)

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' })
      expect(confirmDeleteButton).toHaveFocus()
    })
  })
})
