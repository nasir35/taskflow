import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/types/task';
import { SortableTaskCard } from './SortableTaskCard';
import { TaskEditDialog } from './TaskEditDialog';
import { QuickAddTask } from './QuickAddTask';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import { ListTodo, CheckCircle2, Clock, GripVertical } from 'lucide-react';

export function DraggableTaskList() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { getFilteredTasks, activeFilter, activeProjectId, getProjectById, reorderTasks, tasks } = useTaskStore();
  
  const filteredTasks = getFilteredTasks();
  const project = activeProjectId ? getProjectById(activeProjectId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupedTasks = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    inProgress: filteredTasks.filter((t) => t.status === 'in-progress'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  const handleDragEnd = (event: DragEndEvent, taskGroup: Task[]) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = taskGroup.findIndex((t) => t.id === active.id);
      const newIndex = taskGroup.findIndex((t) => t.id === over.id);
      
      const reorderedGroup = arrayMove(taskGroup, oldIndex, newIndex);
      
      // Merge back into full task list
      const otherTasks = tasks.filter((t) => !taskGroup.some((gt) => gt.id === t.id));
      reorderTasks([...otherTasks, ...reorderedGroup]);
    }
  };

  const getTitle = () => {
    if (project) return project.name;
    switch (activeFilter) {
      case 'today': return 'Today';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return 'All Tasks';
    }
  };

  const getSubtitle = () => {
    const total = filteredTasks.length;
    if (total === 0) return 'No tasks';
    return `${total} task${total !== 1 ? 's' : ''} • Drag to reorder`;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{getTitle()}</h1>
          <p className="text-sm text-muted-foreground mt-1">{getSubtitle()}</p>
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <QuickAddTask />
        </div>

        {/* Task Groups */}
        {activeFilter === 'completed' ? (
          <TaskGroup
            title="Completed"
            icon={<CheckCircle2 className="w-4 h-4" />}
            tasks={groupedTasks.completed}
            onEdit={setEditingTask}
            onDragEnd={(e) => handleDragEnd(e, groupedTasks.completed)}
            sensors={sensors}
          />
        ) : (
          <>
            {groupedTasks.inProgress.length > 0 && (
              <TaskGroup
                title="In Progress"
                icon={<Clock className="w-4 h-4 text-warning" />}
                tasks={groupedTasks.inProgress}
                onEdit={setEditingTask}
                onDragEnd={(e) => handleDragEnd(e, groupedTasks.inProgress)}
                sensors={sensors}
              />
            )}
            <TaskGroup
              title="To Do"
              icon={<ListTodo className="w-4 h-4 text-primary" />}
              tasks={groupedTasks.todo}
              onEdit={setEditingTask}
              onDragEnd={(e) => handleDragEnd(e, groupedTasks.todo)}
              sensors={sensors}
              showEmpty
            />
          </>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              No tasks here. Add a new task to get started.
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingTask && (
        <TaskEditDialog
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

interface TaskGroupProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  showEmpty?: boolean;
}

function TaskGroup({ title, icon, tasks, onEdit, onDragEnd, sensors, showEmpty }: TaskGroupProps) {
  if (tasks.length === 0 && !showEmpty) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-medium text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground/60">
          {tasks.length}
        </span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} onEdit={onEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
