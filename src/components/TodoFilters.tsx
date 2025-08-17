import { useState, useMemo, useEffect } from 'react';
import { Todo } from '@/services/api';

interface TodoFiltersProps {
  todos: Todo[];
  onFilterChange: (filteredTodos: Todo[]) => void;
}

const TodoFilters = ({ todos, onFilterChange }: TodoFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'completed' | 'incomplete'
  >('all');

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(todo =>
        todo.todo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(todo =>
        statusFilter === 'completed' ? todo.completed : !todo.completed
      );
    }

    return filtered;
  }, [todos, searchTerm, statusFilter]);

  // Notify parent component of filtered results
  useEffect(() => {
    onFilterChange(filteredTodos);
  }, [filteredTodos, onFilterChange]);

  const completedCount = todos.filter(todo => todo.completed).length;
  const incompleteCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
            onChange={e =>
              setStatusFilter(
                e.target.value as 'all' | 'completed' | 'incomplete'
              )
            }
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
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {filteredTodos.length !== todos.length && (
        <div className="text-sm text-gray-600">
          Showing {filteredTodos.length} of {todos.length} todos
        </div>
      )}
    </div>
  );
};

export default TodoFilters;
