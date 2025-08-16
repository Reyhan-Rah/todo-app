import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSearchTerm, setStatusFilter, clearFilters } from '@/store/todosSlice'
import { Todo } from '@/services/api'

interface TodoFiltersProps {
  todos: Todo[]
}

const TodoFilters = ({ todos }: TodoFiltersProps) => {
  const dispatch = useAppDispatch()
  const { searchTerm, statusFilter } = useAppSelector(state => state.todos)

  const completedCount = todos.filter(todo => todo.completed).length
  const incompleteCount = todos.filter(todo => !todo.completed).length

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setStatusFilter(e.target.value as 'all' | 'completed' | 'incomplete'))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search todos..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {/* Counts */}
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total: {todos.length}</span>
          <span className="text-green-600">Completed: {completedCount}</span>
          <span className="text-blue-600">Incomplete: {incompleteCount}</span>
        </div>

        {/* Clear Filters */}
        {(searchTerm || statusFilter !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

export default TodoFilters
