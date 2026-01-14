import { useState } from "react";
import {
  Check,
  Circle,
  Flag,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit3,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
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

interface TaskCardProps {
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

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleTaskStatus, toggleSubtask, deleteTask } = useTaskStore();
  const { startPomodoro } = useAppStore();

  const isCompleted = task.status === "completed";
  const dueDateInfo = formatDueDate(task.dueDate);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;

  return (
    <div className={cn("task-card group animate-fade-in", isCompleted && "opacity-60")}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTaskStatus(task.id)}
          className={cn(
            "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            isCompleted
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/40 hover:border-primary"
          )}
        >
          {isCompleted && <Check className="w-3 h-3" />}
        </button>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-sm font-medium leading-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startPomodoro(task.id)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Start Pomodoro"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit3 className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority */}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                priorityConfig[task.priority].bgColor,
                priorityConfig[task.priority].color
              )}
            >
              <Flag className="w-2.5 h-2.5" />
              {priorityConfig[task.priority].label}
            </span>

            {/* Due Date */}
            {dueDateInfo.text && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px]",
                  dueDateInfo.isOverdue ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <Calendar className="w-2.5 h-2.5" />
                {dueDateInfo.text}
              </span>
            )}

            {/* Subtasks */}
            {hasSubtasks && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-2.5 h-2.5" />
                ) : (
                  <ChevronRight className="w-2.5 h-2.5" />
                )}
                {completedSubtasks}/{totalSubtasks}
              </button>
            )}

            {/* Tags */}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Subtasks */}
          {isExpanded && hasSubtasks && (
            <div className="mt-3 space-y-1.5 pl-1 border-l-2 border-muted ml-1">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 pl-2">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                    className="w-3.5 h-3.5"
                  />
                  <span
                    className={cn(
                      "text-xs",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
