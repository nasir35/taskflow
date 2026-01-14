import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { DraggableTaskList } from "@/components/DraggableTaskList";
import { CalendarView } from "@/components/CalendarView";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { SettingsDialog } from "@/components/SettingsDialog";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { useAppStore } from "@/store/appStore";
import { Task } from "@/types/task";
import { ProjectDialog } from "@/components/ProjectDialog";
import { s } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

const Index = () => {
  const {
    focusMode,
    viewMode,
    settingsOpen,
    setSettingsOpen,
    showProjectDialog,
    setShowProjectDialog,
  } = useAppStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for quick add
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const quickAdd = document.querySelector("[data-quick-add]") as HTMLButtonElement;
        quickAdd?.click();
      }

      // Cmd/Ctrl + F for search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search tasks..."]'
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      // Cmd/Ctrl + , for settings
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSettingsOpen]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      {!focusMode && <Sidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <SearchBar />
        {viewMode === "calendar" ? (
          <CalendarView onSelectTask={setEditingTask} />
        ) : (
          <DraggableTaskList />
        )}
      </div>

      {/* Pomodoro Timer */}
      <PomodoroTimer />

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Create Project Dialog */}
      {showProjectDialog && (
        <ProjectDialog
          open={showProjectDialog}
          onClose={() => setShowProjectDialog(false)}
          projectToEdit={null}
        />
      )}

      {/* Edit Dialog from Calendar */}
      {editingTask && (
        <TaskEditDialog
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default Index;
