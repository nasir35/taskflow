import { Search, Command } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchBar() {
  const { searchQuery, setSearchQuery, tasks } = useTaskStore();
  
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.completedAt.startsWith(today);
  }).length;

  const totalTasks = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="pl-9 pr-10 bg-muted/50 border-0 focus-visible:ring-1"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground kbd">
          ⌘F
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{totalTasks}</span> tasks
          </span>
        </div>
        {completedToday > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">{completedToday}</span> done today
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
