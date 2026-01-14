import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Project, FilterType, Priority, Status, Subtask } from '@/types/task';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  activeFilter: FilterType;
  activeProjectId: string | null;
  searchQuery: string;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  
  // Subtask actions
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Filter actions
  setActiveFilter: (filter: FilterType) => void;
  setActiveProjectId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Selectors
  getFilteredTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getProjectById: (id: string) => Project | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultProjects: Project[] = [
  { id: 'inbox', name: 'Inbox', color: '#64748b', icon: 'inbox', createdAt: new Date().toISOString() },
  { id: 'personal', name: 'Personal', color: '#8b5cf6', icon: 'user', createdAt: new Date().toISOString() },
  { id: 'work', name: 'Work', color: '#0ea5e9', icon: 'briefcase', createdAt: new Date().toISOString() },
];

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    description: 'Go through the Q1 project proposal and provide feedback',
    priority: 'high',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['urgent', 'review'],
    projectId: 'work',
    subtasks: [
      { id: 's1', title: 'Read executive summary', completed: true },
      { id: 's2', title: 'Review budget section', completed: false },
      { id: 's3', title: 'Prepare comments', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: '2',
    title: 'Weekly team meeting',
    description: 'Prepare agenda and discussion points for the weekly standup',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: ['meeting', 'team'],
    projectId: 'work',
    subtasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: '3',
    title: 'Grocery shopping',
    description: 'Buy groceries for the week',
    priority: 'low',
    status: 'todo',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    tags: ['errands'],
    projectId: 'personal',
    subtasks: [
      { id: 's4', title: 'Vegetables', completed: false },
      { id: 's5', title: 'Fruits', completed: false },
      { id: 's6', title: 'Dairy', completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: '4',
    title: 'Complete design mockups',
    description: 'Finish the UI designs for the new dashboard feature',
    priority: 'high',
    status: 'completed',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    tags: ['design', 'ui'],
    projectId: 'work',
    subtasks: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: defaultTasks,
      projects: defaultProjects,
      activeFilter: 'all',
      activeProjectId: null,
      searchQuery: '',

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
      },

      toggleTaskStatus: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const newStatus: Status = task.status === 'completed' ? 'todo' : 'completed';
            return {
              ...task,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      reorderTasks: (tasks) => {
        set({ tasks });
      },

      addSubtask: (taskId, title) => {
        const newSubtask: Subtask = {
          id: generateId(),
          title,
          completed: false,
        };
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, subtasks: [...task.subtasks, newSubtask] }
              : task
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : task
          ),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, subtasks: task.subtasks.filter((st) => st.id !== subtaskId) }
              : task
          ),
        }));
      },

      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.map((task) =>
            task.projectId === id ? { ...task, projectId: 'inbox' } : task
          ),
        }));
      },

      setActiveFilter: (filter) => {
        set({ activeFilter: filter, activeProjectId: null });
      },

      setActiveProjectId: (id) => {
        set({ activeProjectId: id, activeFilter: 'all' });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getFilteredTasks: () => {
        const { tasks, activeFilter, activeProjectId, searchQuery } = get();
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        let filtered = tasks;

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (task) =>
              task.title.toLowerCase().includes(query) ||
              task.description.toLowerCase().includes(query) ||
              task.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        // Filter by project
        if (activeProjectId) {
          filtered = filtered.filter((task) => task.projectId === activeProjectId);
        }

        // Filter by type
        switch (activeFilter) {
          case 'today':
            filtered = filtered.filter(
              (task) => task.dueDate === today && task.status !== 'completed'
            );
            break;
          case 'upcoming':
            filtered = filtered.filter(
              (task) =>
                task.dueDate &&
                task.dueDate > today &&
                task.dueDate <= nextWeek &&
                task.status !== 'completed'
            );
            break;
          case 'completed':
            filtered = filtered.filter((task) => task.status === 'completed');
            break;
          default:
            if (!activeProjectId) {
              filtered = filtered.filter((task) => task.status !== 'completed');
            }
        }

        return filtered;
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },

      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id);
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
