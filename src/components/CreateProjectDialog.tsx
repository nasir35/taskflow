import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTaskStore } from "@/store/taskStore";
import { FolderPlus, Inbox, User, Briefcase, Hash, Star, Code, Palette } from "lucide-react";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const PROJECT_COLORS = [
  { name: "Slate", value: "#64748b" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#0ea5e9" },
  { name: "Green", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
];

const PROJECT_ICONS = [
  { id: "inbox", icon: Inbox },
  { id: "user", icon: User },
  { id: "briefcase", icon: Briefcase },
  { id: "hash", icon: Hash },
  { id: "star", icon: Star },
  { id: "code", icon: Code },
];

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const { addProject } = useTaskStore();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState("hash");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    addProject({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });

    toast.success("Project created successfully");
    resetAndClose();
  };

  const resetAndClose = () => {
    setName("");
    setSelectedColor(PROJECT_COLORS[0].value);
    setSelectedIcon("hash");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FolderPlus className="w-5 h-5 text-primary" />
            New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Name</Label>
            <Input
              id="projectName"
              placeholder="e.g. Side Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-10"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2">
              {PROJECT_ICONS.map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={selectedIcon === id ? "default" : "outline"}
                  size="icon"
                  className="w-10 h-10"
                  onClick={() => setSelectedIcon(id)}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-3">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className="relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                >
                  <div
                    className="w-8 h-8 rounded-full border border-black/5"
                    style={{ backgroundColor: color.value }}
                  />
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary ring-2 ring-background" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
