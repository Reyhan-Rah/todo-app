import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '@/services/api';
import TodoItem from './TodoItem';
import { cn } from '@/lib/utils';

interface SortableTodoItemProps {
  todo: Todo;
}

const SortableTodoItem = ({ todo }: SortableTodoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200',
        isDragging
          ? 'cursor-grabbing scale-105 shadow-2xl'
          : 'cursor-grab hover:shadow-md'
      )}
      {...attributes}
      {...listeners}
    >
      <TodoItem todo={todo} />
    </div>
  );
};

export default SortableTodoItem;
