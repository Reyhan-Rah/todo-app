import { useState } from 'react'
import { useTodos, useCreateTodo, useDeleteTodo, useToggleTodo } from '@/hooks/useTodos'
import { CreateTodo } from '@/services/api'

const TodoList = () => {
  const [newTodoText, setNewTodoText] = useState('')
  
  // React Query hooks
  const { data: todos, isLoading, error } = useTodos()
  const createTodoMutation = useCreateTodo()
  const deleteTodoMutation = useDeleteTodo()
  const toggleTodoMutation = useToggleTodo()

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim()) return

    const newTodo: CreateTodo = {
      todo: newTodoText.trim(),
      completed: false,
      userId: 1, // Default user ID for demo
    }

    createTodoMutation.mutate(newTodo, {
      onSuccess: () => {
        setNewTodoText('')
      },
    })
  }

  const handleToggleTodo = (id: number, completed: boolean) => {
    toggleTodoMutation.mutate({ id, completed: !completed })
  }

  const handleDeleteTodo = (id: number) => {
    deleteTodoMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading todos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">Error loading todos: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Todo List</h1>
      
      {/* Create Todo Form */}
      <form onSubmit={handleCreateTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={createTodoMutation.isPending}
          />
          <button
            type="submit"
            disabled={createTodoMutation.isPending || !newTodoText.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTodoMutation.isPending ? 'Adding...' : 'Add Todo'}
          </button>
        </div>
      </form>

      {/* Todo List */}
      <div className="space-y-3">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id, todo.completed)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={toggleTodoMutation.isPending}
              />
              <span
                className={`text-lg ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {todo.todo}
              </span>
            </div>
            
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              disabled={deleteTodoMutation.isPending}
              className="px-3 py-1 text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {todos?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No todos found. Add one above!
        </div>
      )}
    </div>
  )
}

export default TodoList
