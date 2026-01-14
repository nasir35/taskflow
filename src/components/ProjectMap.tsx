import { MoreVertical, Edit3, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Project } from "@/types/task";

interface ProjectListItemProps {
  project: Project;
  isActive: boolean;
  taskCount: number;
  isCollapsed: boolean;
  projectIcons: Record<string, React.ReactNode>;
  onSelect: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export default function ProjectListItem({
  project,
  isActive,
  taskCount,
  isCollapsed,
  projectIcons,
  onSelect,
  onEdit,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center rounded-lg transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <button
        onClick={() => onSelect(project.id)}
        className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
      >
        <div
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: project.color + "20", color: project.color }}
        >
          {projectIcons[project.icon] || <span>📁</span>}
        </div>

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate font-medium">{project.name}</span>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {taskCount}
            </span>
          </>
        )}
      </button>

      {!isCollapsed && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 text-sidebar-foreground hover:bg-sidebar-accent/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
              title="Project options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Edit3 className="w-4 h-4 mr-2" />
              <span>Edit Project</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
