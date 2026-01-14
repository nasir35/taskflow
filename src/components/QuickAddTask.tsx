import { useState, useRef, KeyboardEvent } from 'react';
import { Plus, Calendar, Flag, Tag, X } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Priority } from '@/types/task';
import { format } from 'date-fns';

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-success' },
  { value: 'medium', label: 'Medium', color: 'bg-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive' },
];

export function QuickAddTask() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { addTask, activeProjectId } = useTaskStore();

  const handleSubmit = () => {
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: '',
      priority,
      status: 'todo',
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      tags,
      projectId: activeProjectId || 'inbox',
      subtasks: [],
    });

    // Reset form
    setTitle('');
    setPriority('medium');
    setDueDate(undefined);
    setTags([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed 
                   border-border hover:border-primary/50 text-muted-foreground 
                   hover:text-foreground transition-all duration-200 group"
      >
        <Plus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-sm">Add new task...</span>
        <span className="ml-auto text-xs opacity-60 kbd">⌘K</span>
      </button>
    );
  }

  return (
    <div className="animate-scale-in p-4 rounded-xl border border-border bg-card shadow-medium">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        className="border-0 text-base p-0 h-auto focus-visible:ring-0 bg-transparent"
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                         bg-primary/10 text-primary text-xs"
            >
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        {/* Priority */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 gap-1.5',
                priority === 'high' && 'border-destructive/50 text-destructive',
                priority === 'medium' && 'border-warning/50 text-warning',
                priority === 'low' && 'border-success/50 text-success'
              )}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="text-xs capitalize">{priority}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1" align="start">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                  'hover:bg-muted transition-colors',
                  priority === p.value && 'bg-muted'
                )}
              >
                <div className={cn('w-2 h-2 rounded-full', p.color)} />
                {p.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Due Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">
                {dueDate ? format(dueDate, 'MMM d') : 'Due date'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Tags */}
        <div className="flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag"
            className="h-8 w-20 text-xs"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}
