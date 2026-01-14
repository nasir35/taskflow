import { useState } from 'react';
import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { TaskEditDialog } from './TaskEditDialog';
import { QuickAddTask } from './QuickAddTask';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import { ListTodo, CheckCircle2, Clock } from 'lucide-react';

export function TaskList() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { getFilteredTasks, activeFilter, activeProjectId, getProjectById } = useTaskStore();
  
  const tasks = getFilteredTasks();
  const project = activeProjectId ? getProjectById(activeProjectId) : null;

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === 'todo'),
    inProgress: tasks.filter((t) => t.status === 'in-progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
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
    const total = tasks.length;
    if (total === 0) return 'No tasks';
    return `${total} task${total !== 1 ? 's' : ''}`;
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
          />
        ) : (
          <>
            {groupedTasks.inProgress.length > 0 && (
              <TaskGroup
                title="In Progress"
                icon={<Clock className="w-4 h-4 text-warning" />}
                tasks={groupedTasks.inProgress}
                onEdit={setEditingTask}
              />
            )}
            <TaskGroup
              title="To Do"
              icon={<ListTodo className="w-4 h-4 text-primary" />}
              tasks={groupedTasks.todo}
              onEdit={setEditingTask}
              showEmpty
            />
          </>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
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
  showEmpty?: boolean;
}

function TaskGroup({ title, icon, tasks, onEdit, showEmpty }: TaskGroupProps) {
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
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
