export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "completed";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  tags: string[];
  projectId: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export type FilterType = "all" | "today" | "upcoming" | "completed";
