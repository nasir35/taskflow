import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type ViewMode = "list" | "calendar";

interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
}

interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  isBreak: boolean;
  activeTaskId: string | null;
}

interface AppState {
  theme: Theme;
  focusMode: boolean;
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  settingsOpen: boolean;
  projectCreateOpen: boolean;
  pomodoroSettings: PomodoroSettings;
  pomodoro: PomodoroState;

  // Theme actions
  setTheme: (theme: Theme) => void;

  // UI actions
  toggleFocusMode: () => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSettingsOpen: (open: boolean) => void;
  setProjectCreateOpen: (open: boolean) => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;

  // Pomodoro actions
  startPomodoro: (taskId: string, duration?: number) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  startBreak: (duration?: number) => void;
}

const defaultPomodoro: PomodoroState = {
  isRunning: false,
  timeLeft: 25 * 60,
  totalTime: 25 * 60,
  isBreak: false,
  activeTaskId: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "system",
      focusMode: false,
      sidebarCollapsed: false,
      viewMode: "list",
      settingsOpen: false,
      projectCreateOpen: false,
      pomodoroSettings: {
        workDuration: 25,
        breakDuration: 5,
      },
      pomodoro: defaultPomodoro,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleFocusMode: () => {
        set((state) => ({ focusMode: !state.focusMode }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      setSettingsOpen: (open) => {
        set({ settingsOpen: open });
      },

      setProjectCreateOpen: (open) => {
        set({ projectCreateOpen: open });
      },

      updatePomodoroSettings: (settings) => {
        set((state) => ({
          pomodoroSettings: { ...state.pomodoroSettings, ...settings },
        }));
      },

      startPomodoro: (taskId, duration) => {
        const { pomodoroSettings } = get();
        const time = duration || pomodoroSettings.workDuration * 60;
        set({
          pomodoro: {
            isRunning: true,
            timeLeft: time,
            totalTime: time,
            isBreak: false,
            activeTaskId: taskId,
          },
        });
      },

      pausePomodoro: () => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning: false },
        }));
      },

      resumePomodoro: () => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning: true },
        }));
      },

      resetPomodoro: () => {
        set({ pomodoro: defaultPomodoro });
      },

      tickPomodoro: () => {
        const { pomodoro } = get();
        if (pomodoro.timeLeft <= 0) {
          set({
            pomodoro: { ...pomodoro, isRunning: false, timeLeft: 0 },
          });
          // Show notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(pomodoro.isBreak ? "Break time is over!" : "Pomodoro completed!", {
              body: pomodoro.isBreak
                ? "Time to get back to work."
                : "Great job! Take a short break.",
              icon: "/favicon.ico",
            });
          }
          return;
        }
        set((state) => ({
          pomodoro: { ...state.pomodoro, timeLeft: state.pomodoro.timeLeft - 1 },
        }));
      },

      startBreak: (duration) => {
        const { pomodoroSettings } = get();
        const time = duration || pomodoroSettings.breakDuration * 60;
        set({
          pomodoro: {
            isRunning: true,
            timeLeft: time,
            totalTime: time,
            isBreak: true,
            activeTaskId: null,
          },
        });
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        focusMode: state.focusMode,
        sidebarCollapsed: state.sidebarCollapsed,
        pomodoroSettings: state.pomodoroSettings,
      }),
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "system") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", systemDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

// Initialize theme on load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("app-storage");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.theme) {
        applyTheme(state.theme);
      }
    } catch {
      console.log("error");
    }
  }

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const { theme } = useAppStore.getState();
    if (theme === "system") {
      applyTheme("system");
    }
  });
}
