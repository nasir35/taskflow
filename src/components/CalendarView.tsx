import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Circle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  onSelectTask: (task: Task) => void;
}

export function CalendarView({ onSelectTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { tasks, toggleTaskStatus } = useTaskStore();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getTasksForDay = (day: Date): Task[] => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return tasks.filter(task => task.dueDate === dayStr);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-medium min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="ml-2"
            >
              Today
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-muted/50">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-muted-foreground border-b border-border"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[100px] p-2 border-b border-r border-border transition-colors',
                    !isCurrentMonth && 'bg-muted/30',
                    isCurrentDay && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm w-7 h-7 flex items-center justify-center rounded-full',
                        !isCurrentMonth && 'text-muted-foreground/50',
                        isCurrentDay && 'bg-primary text-primary-foreground font-medium'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={cn(
                          'w-full text-left text-xs px-2 py-1 rounded truncate transition-colors',
                          task.status === 'completed'
                            ? 'bg-muted text-muted-foreground line-through'
                            : task.priority === 'high'
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : task.priority === 'medium'
                            ? 'bg-warning/10 text-warning hover:bg-warning/20'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        )}
                      >
                        {task.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
