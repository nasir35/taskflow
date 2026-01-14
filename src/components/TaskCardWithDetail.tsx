import { useState } from "react";
import {
  Check,
  View,
  Flag,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit3,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  X,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  Circle as CircleIcon,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [showDetails, setShowDetails] = useState(false);
  const { toggleTaskStatus, toggleSubtask, deleteTask } = useTaskStore();
  const { startPomodoro } = useAppStore();

  const isCompleted = task.status === "completed";
  const dueDateInfo = formatDueDate(task.dueDate);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;

  const handleDeleteTask = () => {
    deleteTask(task.id);
    setShowDetails(false);
  };

  return (
    <>
      {/* Task Card */}
      <div
        className={cn("group animate-fade-in transition-all flex-1", isCompleted && "opacity-60")}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskStatus(task.id);
            }}
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
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowDetails(true)}>
                <h3
                  className={cn(
                    "text-sm font-semibold leading-tight",
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
                  onClick={(e) => {
                    e.stopPropagation();
                    startPomodoro(task.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Start Pomodoro"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setShowDetails(true)}>
                      <View className="w-3.5 h-3.5 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium",
                  priorityConfig[task.priority].bgColor,
                  priorityConfig[task.priority].color
                )}
              >
                <Flag className="w-3 h-3" />
                {priorityConfig[task.priority].label}
              </span>

              {/* Due Date */}
              {dueDateInfo.text && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full",
                    dueDateInfo.isOverdue
                      ? "text-destructive bg-destructive/10"
                      : "text-muted-foreground bg-muted/50"
                  )}
                >
                  <Calendar className="w-3 h-3" />
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

              {/* Image Indicator */}
              {task.imageUrl && (
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full inline-flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Image
                </span>
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

      {/* Detail Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={cn(
                    "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40 hover:border-primary"
                  )}
                >
                  {isCompleted && <Check className="w-4 h-4" />}
                </button>
                <div className="flex-1">
                  <DialogTitle
                    className={cn(
                      "text-xl font-bold leading-tight",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </DialogTitle>
                </div>
              </div>
              <DialogClose />
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Task Image */}
            {task.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={task.imageUrl}
                  alt={task.title}
                  className="w-full h-auto object-cover max-h-80"
                />
              </div>
            )}

            {/* Description */}
            {task.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg">
                  {task.description}
                </p>
              </div>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Priority
                </h4>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                    priorityConfig[task.priority].bgColor,
                    priorityConfig[task.priority].color
                  )}
                >
                  <Flag className="w-4 h-4" />
                  {priorityConfig[task.priority].label}
                </span>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Due Date
                </h4>
                {dueDateInfo.text ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                      dueDateInfo.isOverdue
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    {dueDateInfo.text}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">No due date</span>
                )}
              </div>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/60 text-secondary-foreground"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            {hasSubtasks && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </h4>
                <div className="space-y-2 bg-muted/20 p-3 rounded-lg border border-border/50">
                  {task.subtasks.map((subtask) => (
                    <button
                      key={subtask.id}
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-muted/30 rounded transition-colors text-left group"
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          subtask.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40 group-hover:border-primary"
                        )}
                      >
                        {subtask.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={cn(
                          "text-sm flex-1",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(task);
                  setShowDetails(false);
                }}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startPomodoro(task.id)}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Pomodoro
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteTask} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
