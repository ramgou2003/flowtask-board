export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags: string[];
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

export interface KanbanBoard {
  columns: Column[];
  lastUpdated: Date;
}

export type Priority = Task['priority'];