import { useState, useEffect } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/services/api';
import CreateTodoForm from './CreateTodoForm';
import SortableTodoList from './SortableTodoList';
import TodoFilters from './TodoFilters';
import LoadingSkeleton from './LoadingSkeleton';

const TodoList = () => {
  const { data: todos, isLoading, error } = useTodos();
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [orderedTodos, setOrderedTodos] = useState<Todo[]>([]);

  // Initialize filtered todos and ordered todos when todos data changes
  useEffect(() => {
    if (todos) {
      setFilteredTodos(todos);
      setOrderedTodos(todos);
    }
  }, [todos]);

  // Handle reordering of todos
  const handleReorder = (newOrder: Todo[]) => {
    setOrderedTodos(newOrder);
    // Update filtered todos to maintain the new order
    const newFilteredOrder = newOrder.filter(todo =>
      filteredTodos.some(filteredTodo => filteredTodo.id === todo.id)
    );
    setFilteredTodos(newFilteredOrder);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Todo List
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Todos
          </div>
          <div className="text-gray-600">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
        Todo List
      </h1>

      <CreateTodoForm />

      {/* Filters */}
      {todos && todos.length > 0 && (
        <TodoFilters todos={orderedTodos} onFilterChange={setFilteredTodos} />
      )}

      {/* Todo List */}
      <SortableTodoList todos={filteredTodos} onReorder={handleReorder}>
        {/* Empty State */}
        {filteredTodos.length === 0 && todos && todos.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <div className="text-xl font-medium text-gray-600 mb-2">
              No todos found
            </div>
            <div className="text-gray-500">
              Try adjusting your search or filters
            </div>
          </div>
        ) : todos && todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <div className="text-xl font-medium text-gray-600 mb-2">
              No todos yet
            </div>
            <div className="text-gray-500">
              Add your first todo above to get started!
            </div>
          </div>
        ) : null}
      </SortableTodoList>
    </div>
  );
};

export default TodoList;
