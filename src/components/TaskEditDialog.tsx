import { useState, useEffect } from 'react';
import { X, Flag, Calendar, Tag } from 'lucide-react';
import { Task, Priority, Status } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface TaskEditDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-success' },
  { value: 'medium', label: 'Medium', color: 'bg-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive' },
];

const statuses: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function TaskEditDialog({ task, open, onClose }: TaskEditDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<Status>(task.status);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? parseISO(task.dueDate) : undefined
  );
  const [tags, setTags] = useState<string[]>(task.tags);
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  const { updateTask, addSubtask, deleteSubtask, toggleSubtask, projects } = useTaskStore();

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
    setTags(task.tags);
  }, [task]);

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      tags,
    });
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      addSubtask(task.id, subtaskInput.trim());
      setSubtaskInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (Markdown supported)"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', p.color)} />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
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
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                             bg-primary/10 text-primary text-xs"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Subtasks
            </label>
            <div className="space-y-1.5 mb-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(task.id, subtask.id)}
                    className="rounded"
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      subtask.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                placeholder="Add subtask"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleAddSubtask}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
