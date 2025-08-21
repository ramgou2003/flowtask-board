export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags: string[];
  assignee?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface KanbanBoard {
  columns: Column[];
  lastUpdated: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  board: KanbanBoard;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectsData {
  projects: Project[];
  lastUpdated: Date;
}

export type Priority = Task['priority'];