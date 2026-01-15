import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "@/types/task";
import { SortableTaskCard } from "./SortableTaskCard";
import { TaskEditDialog } from "./TaskEditDialog";
import { QuickAddTask } from "./QuickAddTask";
import { useTaskStore } from "@/store/taskStore";
import { cn } from "@/lib/utils";
import { ListTodo, CheckCircle2, Clock, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-500/10",
    textColor: "text-emerald-700",
  },
  medium: {
    label: "Medium",
    color: "bg-amber-500",
    lightColor: "bg-amber-500/10",
    textColor: "text-amber-700",
  },
  high: {
    label: "High",
    color: "bg-rose-500",
    lightColor: "bg-rose-500/10",
    textColor: "text-rose-700",
  },
};

export function DraggableTaskList() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const { getFilteredTasks, activeFilter, activeProjectId, getProjectById, reorderTasks, tasks } =
    useTaskStore();

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

  // Apply priority filter
  const priorityFilteredTasks =
    selectedPriorities.length > 0
      ? filteredTasks.filter((t) => selectedPriorities.includes(t.priority))
      : filteredTasks;

  const groupedTasks = {
    todo: priorityFilteredTasks.filter((t) => t.status === "todo"),
    inProgress: priorityFilteredTasks.filter((t) => t.status === "in-progress"),
    completed: priorityFilteredTasks.filter((t) => t.status === "completed"),
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

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const clearFilter = () => {
    setSelectedPriorities([]);
  };

  const getTitle = () => {
    if (project) return project.name;
    switch (activeFilter) {
      case "today":
        return "Today";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return "All Tasks";
    }
  };

  const getSubtitle = () => {
    const total = priorityFilteredTasks.length;
    if (total === 0) return "No tasks";
    return `${total} task${total !== 1 ? "s" : ""} • Drag to reorder`;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground mt-1">{getSubtitle()}</p>
          </div>

          {/* Priority Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 relative",
                  selectedPriorities.length > 0 && "ring-1 ring-primary"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Priority</span>
                {selectedPriorities.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {selectedPriorities.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2 space-y-1">
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                  const isSelected = selectedPriorities.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => togglePriority(key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        "border border-transparent",
                        isSelected
                          ? `${config.lightColor} border-transparent bg-opacity-100`
                          : "hover:bg-muted"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full", config.color)} />
                      <span className={isSelected ? config.textColor : "text-foreground"}>
                        {config.label}
                      </span>
                      {isSelected && <span className="ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>

              {selectedPriorities.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={clearFilter}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filter
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <QuickAddTask />
        </div>

        {/* Task Groups */}
        {activeFilter === "completed" ? (
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
        {priorityFilteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {selectedPriorities.length > 0 ? "No matching tasks" : "All caught up!"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedPriorities.length > 0
                ? "Try adjusting your priority filter."
                : "No tasks here. Add a new task to get started."}
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
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground/60">{tasks.length}</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
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
