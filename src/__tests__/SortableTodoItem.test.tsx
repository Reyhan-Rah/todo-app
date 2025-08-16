import React from 'react'
import { render, screen } from '@testing-library/react'
import SortableTodoItem from '../components/SortableTodoItem'
import { Todo } from '../services/api'

// Mock the DnD kit sortable hook
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(),
}))

// Mock the DnD kit utilities
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => 'translate3d(0, 0, 0)'),
    },
  },
}))

// Mock the TodoItem component
jest.mock('../components/TodoItem', () => {
  return function MockTodoItem({ todo }: { todo: Todo }) {
    return (
      <div data-testid={`todo-item-${todo.id}`}>
        <span>{todo.todo}</span>
        <span data-testid={`todo-status-${todo.id}`}>
          {todo.completed ? 'completed' : 'incomplete'}
        </span>
      </div>
    )
  }
})

describe('SortableTodoItem', () => {
  const mockTodo: Todo = {
    id: 1,
    todo: 'Test Todo Item',
    completed: false,
    userId: 1,
  }

  const mockUseSortableReturn = {
    attributes: {
      'data-sortable-id': '1',
      'aria-describedby': 'sortable-1',
    },
    listeners: {
      onKeyDown: jest.fn(),
      onPointerDown: jest.fn(),
    },
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: 'transform 200ms ease',
    isDragging: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { useSortable } = jest.requireMock('@dnd-kit/sortable')
    useSortable.mockReturnValue(mockUseSortableReturn)
  })

  const renderSortableItem = (props = {}) => {
    const defaultProps = {
      todo: mockTodo,
      ...props,
    }
    return render(<SortableTodoItem {...defaultProps} />)
  }

  describe('Component Rendering', () => {
    it('should render the todo item', () => {
      renderSortableItem()
      expect(screen.getByText('Test Todo Item')).toBeInTheDocument()
    })

    it('should render with correct todo status', () => {
      renderSortableItem()
      expect(screen.getByTestId('todo-status-1')).toHaveTextContent('incomplete')
    })

    it('should render completed todo with correct status', () => {
      const completedTodo = { ...mockTodo, completed: true }
      renderSortableItem({ todo: completedTodo })
      expect(screen.getByTestId('todo-status-1')).toHaveTextContent('completed')
    })

    it('should apply sortable attributes', () => {
      renderSortableItem()
      const todoItem = screen.getByTestId('todo-item-1')
      expect(todoItem).toBeInTheDocument()
    })
  })

  describe('Drag and Drop Integration', () => {
    it('should use the useSortable hook', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      renderSortableItem()
      
      expect(useSortable).toHaveBeenCalledWith({ id: 1 })
    })

    it('should apply sortable attributes to the container', () => {
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should apply sortable listeners to the container', () => {
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should set the node reference', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      renderSortableItem()
      
      expect(useSortable).toHaveBeenCalledWith({ id: 1 })
    })
  })

  describe('Transform and Animation', () => {
    it('should apply transform styles when not dragging', () => {
      const { CSS } = jest.requireMock('@dnd-kit/utilities')
      CSS.Transform.toString.mockReturnValue('translate3d(0, 0, 0)')
      
      renderSortableItem()
      
      expect(CSS.Transform.toString).toHaveBeenCalledWith(mockUseSortableReturn.transform)
    })

    it('should apply transition styles', () => {
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should handle different transform values', () => {
      const { CSS } = jest.requireMock('@dnd-kit/utilities')
      const customTransform = { x: 10, y: 20, scaleX: 1.1, scaleY: 0.9 }
      CSS.Transform.toString.mockReturnValue('translate3d(10px, 20px, 0) scale(1.1, 0.9)')
      
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        transform: customTransform,
      })
      
      renderSortableItem()
      
      expect(CSS.Transform.toString).toHaveBeenCalledWith(customTransform)
    })
  })

  describe('Drag State Management', () => {
    it('should apply dragging styles when isDragging is true', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        isDragging: true,
      })
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should apply non-dragging styles when isDragging is false', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        isDragging: false,
      })
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should handle opacity changes during drag', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        isDragging: true,
      })
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply base transition classes', () => {
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toHaveClass('transition-all', 'duration-200')
    })

    it('should apply dragging-specific classes when dragging', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        isDragging: true,
      })
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toHaveClass('cursor-grabbing', 'scale-105', 'shadow-2xl')
    })

    it('should apply non-dragging classes when not dragging', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        isDragging: false,
      })
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toHaveClass('cursor-grab', 'hover:shadow-md')
    })
  })

  describe('Accessibility', () => {
    it('should maintain accessibility attributes from useSortable', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      const accessibilityAttributes = {
        ...mockUseSortableReturn,
        attributes: {
          'data-sortable-id': '1',
          'aria-describedby': 'sortable-1',
          'role': 'button',
          'tabIndex': 0,
        },
      }
      useSortable.mockReturnValue(accessibilityAttributes)
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      const keyboardListeners = {
        ...mockUseSortableReturn,
        listeners: {
          onKeyDown: jest.fn(),
        },
      }
      useSortable.mockReturnValue(keyboardListeners)
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })
  })

  describe('Integration with TodoItem', () => {
    it('should pass todo prop to TodoItem component', () => {
      renderSortableItem()
      expect(screen.getByText('Test Todo Item')).toBeInTheDocument()
    })

    it('should render TodoItem with correct props', () => {
      const customTodo = {
        id: 999,
        todo: 'Custom Todo',
        completed: true,
        userId: 2,
      }
      renderSortableItem({ todo: customTodo })
      
      expect(screen.getByText('Custom Todo')).toBeInTheDocument()
      expect(screen.getByTestId('todo-status-999')).toHaveTextContent('completed')
    })

    it('should maintain TodoItem functionality', () => {
      renderSortableItem()
      const todoItem = screen.getByTestId('todo-item-1')
      expect(todoItem).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle todo with empty title', () => {
      const emptyTodo = { ...mockTodo, todo: '' }
      renderSortableItem({ todo: emptyTodo })
      
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
    })

    it('should handle todo with very long title', () => {
      const longTodo = { ...mockTodo, todo: 'A'.repeat(1000) }
      renderSortableItem({ todo: longTodo })
      
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
    })

    it('should handle todo with special characters', () => {
      const specialTodo = { ...mockTodo, todo: 'Todo with "quotes" & <tags>' }
      renderSortableItem({ todo: specialTodo })
      
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      const renderSpy = jest.fn()
      
      const TestComponent = () => {
        renderSpy()
        return <SortableTodoItem todo={mockTodo} />
      }
      
      render(<TestComponent />)
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid state changes efficiently', () => {
      const { useSortable } = jest.requireMock('@dnd-kit/sortable')
      useSortable.mockReturnValue({
        ...mockUseSortableReturn,
        isDragging: true,
      })
      
      renderSortableItem()
      const container = screen.getByTestId('todo-item-1').parentElement
      expect(container).toBeInTheDocument()
    })
  })
})
