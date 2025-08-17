import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '@/services/api';
import TodoItem from '@/components/TodoItem';

interface DragOverlayProps {
  todo: Todo;
}

const DragOverlay = ({ todo }: DragOverlayProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="opacity-80 shadow-2xl rounded-lg"
      {...attributes}
      {...listeners}
    >
      <TodoItem todo={todo} />
    </div>
  );
};

export default DragOverlay;
