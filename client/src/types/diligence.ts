export interface Document {
  id: string;
  name: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  path: string;
  folder?: string;
  dealId: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  name: string;
  category: string;
  dealId: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  checklistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistFormData {
  name: string;
  category: string;
}

export interface ChecklistItemFormData {
  title: string;
  description?: string;
  completed?: boolean;
  checklistId: string;
}
