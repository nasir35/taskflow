import { useState, useEffect } from "react";
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
import { Project } from "@/types/task";
import { useAppStore } from "@/store/appStore";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
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

export function ProjectDialog({ open, onClose, projectToEdit }: ProjectDialogProps) {
  const { addProject, updateProject } = useTaskStore();
  const { editingProject, setEditingProject } = useAppStore();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState("hash");
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!editingProject;

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingProject) {
      setName(editingProject.name);
      setSelectedColor(editingProject.color);
      setSelectedIcon(editingProject.icon);
    } else {
      resetForm();
    }
  }, [open, editingProject, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && editingProject) {
        // Update existing project
        updateProject(editingProject.id, {
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
        toast.success("Project updated successfully");
        setEditingProject(null);
      } else {
        // Create new project
        addProject({
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
        toast.success("Project created successfully");
      }

      resetAndClose();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update project" : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedColor(PROJECT_COLORS[0].value);
    setSelectedIcon("hash");
  };

  const resetAndClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditMode ? (
              <>
                <Palette className="w-5 h-5 text-primary" />
                Edit Project
              </>
            ) : (
              <>
                <FolderPlus className="w-5 h-5 text-primary" />
                New Project
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g. Side Project, Work Tasks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={isLoading}
              className="h-10"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label>Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_ICONS.map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={selectedIcon === id ? "default" : "outline"}
                  size="icon"
                  className="w-10 h-10 transition-all"
                  onClick={() => setSelectedIcon(id)}
                  disabled={isLoading}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-3">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  disabled={isLoading}
                  className="relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-black/5 transition-all"
                    style={{ backgroundColor: color.value }}
                  />
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary ring-2 ring-background" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={resetAndClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
