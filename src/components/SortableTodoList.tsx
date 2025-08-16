import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import { Todo } from '@/services/api'
import SortableTodoItem from './SortableTodoItem'
import DragOverlay from './DragOverlay'

interface SortableTodoListProps {
  todos: Todo[]
  onReorder: (newOrder: Todo[]) => void
  children?: React.ReactNode
}

const SortableTodoList = ({ todos, onReorder, children }: SortableTodoListProps) => {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const todo = todos.find(t => t.id === active.id)
    setActiveTodo(todo || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTodo(null)

    if (active.id !== over?.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id)
      const newIndex = todos.findIndex((todo) => todo.id === over?.id)

      const newOrder = arrayMove(todos, oldIndex, newIndex)
      onReorder(newOrder)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {todos.map((todo) => (
            <SortableTodoItem key={todo.id} todo={todo} />
          ))}
        </div>
        {children}
      </SortableContext>
      
      {/* Drag Overlay */}
      {activeTodo && (
        <DragOverlay todo={activeTodo} />
      )}
    </DndContext>
  )
}

export default SortableTodoList
