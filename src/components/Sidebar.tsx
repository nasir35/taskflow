import {
  Inbox,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Plus,
  Settings,
  Sun,
  Moon,
  Monitor,
  Briefcase,
  User,
  Menu,
  List,
  Calendar,
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { FilterType } from "@/types/task";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/InstallButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const filterItems: { id: FilterType; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Tasks", icon: <Inbox className="w-4 h-4" /> },
  { id: "today", label: "Today", icon: <CalendarDays className="w-4 h-4" /> },
  { id: "upcoming", label: "Upcoming", icon: <CalendarClock className="w-4 h-4" /> },
  { id: "completed", label: "Completed", icon: <CheckCircle2 className="w-4 h-4" /> },
];

const projectIcons: Record<string, React.ReactNode> = {
  inbox: <Inbox className="w-4 h-4" />,
  briefcase: <Briefcase className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
};

export function Sidebar() {
  const { activeFilter, activeProjectId, setActiveFilter, setActiveProjectId, projects, tasks } =
    useTaskStore();

  const {
    theme,
    setTheme,
    sidebarCollapsed,
    toggleSidebar,
    viewMode,
    setViewMode,
    setSettingsOpen,
    setProjectCreateOpen,
  } = useAppStore();

  const getTaskCount = (projectId: string) => {
    return tasks.filter((t) => t.projectId === projectId && t.status !== "completed").length;
  };

  const getTodayCount = () => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter((t) => t.dueDate === today && t.status !== "completed").length;
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">TaskFlow</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* View Mode Toggle */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors",
                viewMode === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-3">
        <div className="space-y-1">
          {filterItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                activeFilter === item.id && !activeProjectId
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "today" && getTodayCount() > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      {getTodayCount()}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 p-3 overflow-auto">
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between mb-2 px-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </span>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setProjectCreateOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="space-y-1">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                activeProjectId === project.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{ backgroundColor: project.color + "20", color: project.color }}
              >
                {projectIcons[project.icon] || <FolderKanban className="w-3 h-3" />}
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{project.name}</span>
                  <span className="text-xs text-muted-foreground">{getTaskCount(project.id)}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground">
                {theme === "light" ? (
                  <Sun className="w-4 h-4" />
                ) : theme === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
