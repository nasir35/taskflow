import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import {
  Check,
  Flag,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Play,
  GripVertical,
} from "lucide-react";
import { Task, Priority } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskCard } from "./TaskCardWithDetail";

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityConfig: Record<Priority, { color: string; bgColor: string; label: string }> = {
  high: { color: "text-destructive", bgColor: "bg-destructive/10", label: "High" },
  medium: { color: "text-warning", bgColor: "bg-warning/10", label: "Medium" },
  low: { color: "text-success", bgColor: "bg-success/10", label: "Low" },
};

function formatDueDate(dateStr: string | null): { text: string; isOverdue: boolean } {
  if (!dateStr) return { text: "", isOverdue: false };

  const date = parseISO(dateStr);
  const isOverdue = isPast(date) && !isToday(date);

  if (isToday(date)) return { text: "Today", isOverdue: false };
  if (isTomorrow(date)) return { text: "Tomorrow", isOverdue: false };

  return { text: format(date, "MMM d"), isOverdue };
}

export function SortableTaskCard({ task, onEdit }: SortableTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleTaskStatus, toggleSubtask, deleteTask } = useTaskStore();
  const { startPomodoro } = useAppStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCompleted = task.status === "completed";
  const dueDateInfo = formatDueDate(task.dueDate);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "task-card group animate-fade-in",
        isCompleted && "opacity-60",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Main Content */}
        <TaskCard task={task} onEdit={onEdit} />
      </div>
    </div>
  );
}
