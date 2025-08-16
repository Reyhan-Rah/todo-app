import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Todo, CreateTodo, UpdateTodo } from '@/services/api'
import { todoApi } from '@/services/api'

// Async thunks for API operations
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async () => {
    const response = await todoApi.getAll()
    return response
  }
)

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (todoData: CreateTodo) => {
    const response = await todoApi.create(todoData)
    return response
  }
)

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, data }: { id: number; data: UpdateTodo }) => {
    const response = await todoApi.update(id, data)
    return response
  }
)

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: number) => {
    await todoApi.delete(id)
    return id
  }
)

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async ({ id, completed }: { id: number; completed: boolean }) => {
    const response = await todoApi.toggle(id, completed)
    return response
  }
)

// Todo state interface
interface TodosState {
  items: Todo[]
  filteredItems: Todo[]
  loading: boolean
  error: string | null
  searchTerm: string
  statusFilter: 'all' | 'completed' | 'incomplete'
}

// Initial state
const initialState: TodosState = {
  items: [],
  filteredItems: [],
  loading: false,
  error: null,
  searchTerm: '',
  statusFilter: 'all',
}

// Todos slice
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Set search term
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
      state.filteredItems = applyFilters(state.items, action.payload, state.statusFilter)
    },
    
    // Set status filter
    setStatusFilter: (state, action: PayloadAction<'all' | 'completed' | 'incomplete'>) => {
      state.statusFilter = action.payload
      state.filteredItems = applyFilters(state.items, state.searchTerm, action.payload)
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.searchTerm = ''
      state.statusFilter = 'all'
      state.filteredItems = state.items
    },
    
    // Reorder todos
    reorderTodos: (state, action: PayloadAction<Todo[]>) => {
      state.items = action.payload
      state.filteredItems = applyFilters(action.payload, state.searchTerm, state.statusFilter)
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch todos
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.filteredItems = applyFilters(action.payload, state.searchTerm, state.statusFilter)
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch todos'
      })
    
    // Create todo
    builder
      .addCase(createTodo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
        state.filteredItems = applyFilters(state.items, state.searchTerm, state.statusFilter)
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create todo'
      })
    
    // Update todo
    builder
      .addCase(updateTodo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(todo => todo.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
          state.filteredItems = applyFilters(state.items, state.searchTerm, state.statusFilter)
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update todo'
      })
    
    // Delete todo
    builder
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(todo => todo.id !== action.payload)
        state.filteredItems = applyFilters(state.items, state.searchTerm, state.statusFilter)
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete todo'
      })
    
    // Toggle todo
    builder
      .addCase(toggleTodo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(todo => todo.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
          state.filteredItems = applyFilters(state.items, state.searchTerm, state.statusFilter)
        }
      })
      .addCase(toggleTodo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to toggle todo'
      })
  },
})

// Helper function to apply filters
const applyFilters = (
  todos: Todo[], 
  searchTerm: string, 
  statusFilter: 'all' | 'completed' | 'incomplete'
): Todo[] => {
  let filtered = todos

  // Apply search filter
  if (searchTerm.trim()) {
    filtered = filtered.filter(todo =>
      todo.todo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(todo =>
      statusFilter === 'completed' ? todo.completed : !todo.completed
    )
  }

  return filtered
}

// Export actions
export const { 
  setSearchTerm, 
  setStatusFilter, 
  clearFilters, 
  reorderTodos, 
  clearError 
} = todosSlice.actions

// Export selectors
export const selectTodos = (state: { todos: TodosState }) => state.todos.items
export const selectFilteredTodos = (state: { todos: TodosState }) => state.todos.filteredItems
export const selectTodosLoading = (state: { todos: TodosState }) => state.todos.loading
export const selectTodosError = (state: { todos: TodosState }) => state.todos.error
export const selectSearchTerm = (state: { todos: TodosState }) => state.todos.searchTerm
export const selectStatusFilter = (state: { todos: TodosState }) => state.todos.statusFilter
export const selectCompletedCount = (state: { todos: TodosState }) => 
  state.todos.items.filter(todo => todo.completed).length
export const selectIncompleteCount = (state: { todos: TodosState }) => 
  state.todos.items.filter(todo => !todo.completed).length

export default todosSlice.reducer
