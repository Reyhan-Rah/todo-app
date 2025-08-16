import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createTodo } from '@/store/todosSlice'
import { CreateTodoSchema } from '@/services/api'
import { cn } from '@/lib/utils'

const CreateTodoForm = () => {
  const [newTodoText, setNewTodoText] = useState('')
  const [validationError, setValidationError] = useState<string>('')
  
  const dispatch = useAppDispatch()
  const { loading: isCreating } = useAppSelector(state => state.todos)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    try {
      // Validate input using Zod
      const validatedData = CreateTodoSchema.parse({
        todo: newTodoText.trim(),
        completed: false,
        userId: 1,
      })

      dispatch(createTodo(validatedData)).then((result) => {
        if (createTodo.fulfilled.match(result)) {
          setNewTodoText('')
          setValidationError('')
        } else if (createTodo.rejected.match(result)) {
          setValidationError(result.error.message || 'Failed to create todo')
        }
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        setValidationError(error.message)
      } else {
        setValidationError('An unexpected error occurred')
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoText(e.target.value)
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
    }
  }

  const isFormValid = newTodoText.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={handleInputChange}
            placeholder="Add a new todo..."
            className={cn(
              "flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
              validationError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            disabled={isCreating}
            aria-describedby={validationError ? "todo-error" : undefined}
            aria-invalid={!!validationError}
          />
          <button
            type="submit"
            disabled={isCreating || !isFormValid}
            className={cn(
              "px-6 py-2 text-white rounded-lg transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              isFormValid
                ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                : "bg-gray-400 cursor-not-allowed",
              isCreating && "opacity-75 cursor-not-allowed"
            )}
          >
            {isCreating ? 'Adding...' : 'Add Todo'}
          </button>
        </div>
        
        {validationError && (
          <div
            id="todo-error"
            className="text-sm text-red-600 flex items-center gap-2"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {validationError}
          </div>
        )}
      </div>
    </form>
  )
}

export default CreateTodoForm
