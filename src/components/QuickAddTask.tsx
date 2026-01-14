import { useState, useRef, KeyboardEvent, ClipboardEvent, DragEvent } from "react";
import {
  Plus,
  Calendar,
  Flag,
  Tag,
  X,
  ListTodo,
  AlignLeft,
  Image as ImageIcon,
  BookText,
  Loader2,
  Trash2,
  Cloud,
  Check,
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Priority, Subtask } from "@/types/task";
import { format } from "date-fns";
import { toast } from "sonner";

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-emerald-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-rose-500" },
];

export function QuickAddTask() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { addTask, activeProjectId } = useTaskStore();

  // --- Image Upload Logic ---
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "taskflow");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dax7yvopb/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.includes("image")) {
      toast.error("Please select an image file");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.includes("image")) {
      const file = item.getAsFile();
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // --- Actions ---
  const handleSubmit = async () => {
    if (!title.trim() || isUploading) return;

    setIsUploading(true);
    let uploadedImageUrl: string | null = null;

    // Upload image if selected
    if (imageFile) {
      uploadedImageUrl = await uploadToCloudinary(imageFile);
      if (!uploadedImageUrl) {
        setIsUploading(false);
        return;
      }
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "todo",
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      tags,
      projectId: activeProjectId || "inbox",
      imageUrl: uploadedImageUrl || undefined,
      subtasks: subtasks.map((t) => ({ id: Math.random().toString(), title: t, completed: false })),
    });

    toast.success("Task created successfully");
    resetForm();
    setIsUploading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(undefined);
    setTags([]);
    setTagInput("");
    setSubtasks([]);
    setSubtaskInput("");
    setImageFile(null);
    setImagePreview(undefined);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/40 transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Add a new task...
        </span>
        <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border border-border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground opacity-75">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div
      ref={dragRef}
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "animate-in fade-in zoom-in-95 duration-200 p-6 rounded-2xl border shadow-md transition-all",
        isDragging ? "border-primary/60 bg-primary/5 shadow-lg" : "border-border bg-card"
      )}
    >
      {/* Title Input */}
      <div className="grid grid-cols-12">
        <BookText className="w-5 h-5 mt-2.5 text-muted-foreground/50 shrink-0" />
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="col-span-10 border-2 border-border/80 focus:border-0 text-xl font-bold p-1 px-2 h-auto bg-transparent placeholder:text-muted-foreground/30 focus:outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div className="grid grid-cols-12 mt-5">
        <AlignLeft className="w-5 h-5 mt-2.5 text-muted-foreground/50 shrink-0" />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          className="col-span-10 min-h-[90px] border-2 border-border/80 focus:border-0  p-3 bg-background/50 rounded-lg resize-none text-sm text-foreground placeholder:text-muted-foreground/40 transition-all hover:border-border/60 focus:outline-none"
        />
      </div>

      {/* Subtasks Section */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
          <ListTodo className="w-4 h-4" />
          Subtasks
        </div>
        <div className="space-y-2.5 bg-background/30 rounded-lg p-3.5 border border-border/20">
          {subtasks.map((st, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded border-border/60 cursor-not-allowed bg-background"
              />
              <span className="text-sm flex-1 text-foreground">{st}</span>
              <button
                onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              >
                <X className="w-4 h-4 text-destructive/70 hover:text-destructive" />
              </button>
            </div>
          ))}
          <Input
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && subtaskInput.trim()) {
                setSubtasks([...subtasks, subtaskInput.trim()]);
                setSubtaskInput("");
              }
            }}
            placeholder="Add a subtask... (press Enter)"
            className="h-9 text-sm border border-border/40 bg-background rounded-md focus-visible:ring-1 focus-visible:ring-primary/30 hover:border-border/60 transition-all"
          />
        </div>
      </div>

      {/* Image Upload Area */}
      {!imagePreview && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "mt-5 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer group",
            isDragging
              ? "border-primary/70 bg-primary/10"
              : "border-border/70 hover:border-primary/40 hover:bg-accent/30"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="p-3.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <Cloud className="w-6 h-6 text-primary/70" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                PNG, JPG, GIF up to 10MB • You can also paste (⌘V)
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mt-5 rounded-xl overflow-hidden border border-border bg-muted group">
          <img
            src={imagePreview}
            alt="Upload preview"
            className="w-auto h-auto object-cover max-h-64"
          />
          <button
            onClick={() => {
              setImagePreview(undefined);
              setImageFile(null);
            }}
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-destructive rounded-lg text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
            <p className="text-xs text-white font-medium">
              Image will be uploaded when you create the task
            </p>
          </div>
        </div>
      )}

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 text-xs font-medium text-secondary-foreground hover:bg-secondary transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              {tag}
              <button
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex items-center flex-wrap gap-2.5 mt-6 pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg gap-2 text-xs font-medium hover:bg-accent/50 transition-colors"
              >
                <Flag
                  className={cn(
                    "w-4 h-4",
                    priority === "high"
                      ? "text-rose-500"
                      : priority === "medium"
                      ? "text-amber-500"
                      : "text-emerald-500"
                  )}
                />
                <span className="capitalize hidden sm:inline">{priority}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2" align="start">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <div className={cn("w-2.5 h-2.5 rounded-full", p.color)} />
                  <span className="flex-1 text-left font-medium">{p.label}</span>
                  {priority === p.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg gap-2 text-xs font-medium hover:bg-accent/50 transition-colors"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">
                  {dueDate ? format(dueDate, "MMM d") : "Date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <CalendarComponent mode="single" selected={dueDate} onSelect={setDueDate} />
            </PopoverContent>
          </Popover>

          {/* Tag Input */}
          <div className="flex items-center gap-2 border border-border/40 rounded-lg px-3 h-9 bg-background/50 hover:border-border/60 transition-all focus-within:ring-1 focus-within:ring-primary/30">
            <Tag className="w-4 h-4 text-muted-foreground/60" />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                  setTagInput("");
                }
              }}
              placeholder="Add tag..."
              className="text-xs bg-transparent border-0 focus:ring-0 outline-none flex-1 placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="h-9 rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || isUploading}
            className="h-9 rounded-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Create Task</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
