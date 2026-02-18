import api from './api';
import type { Document, Checklist, ChecklistFormData, ChecklistItemFormData } from '../types/diligence';

export const documentService = {
  async getDealDocuments(dealId: string): Promise<Document[]> {
    const response = await api.get<{ status: string; data: { documents: Document[] } }>(`/deals/${dealId}/documents`);
    return response.data.data.documents;
  },

  async upload(dealId: string, file: File, folder?: string, tags?: string[]): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (tags) formData.append('tags', JSON.stringify(tags));

    const response = await api.post<{ status: string; data: { document: Document } }>(
      `/deals/${dealId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.document;
  },

  async download(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};

export const checklistService = {
  async getDealChecklists(dealId: string): Promise<Checklist[]> {
    const response = await api.get<{ status: string; data: { checklists: Checklist[] } }>(`/deals/${dealId}/checklists`);
    return response.data.data.checklists;
  },

  async create(dealId: string, data: ChecklistFormData): Promise<Checklist> {
    const response = await api.post<{ status: string; data: { checklist: Checklist } }>(
      `/deals/${dealId}/checklists`,
      data
    );
    return response.data.data.checklist;
  },

  async update(id: string, data: Partial<ChecklistFormData>): Promise<Checklist> {
    const response = await api.put<{ status: string; data: { checklist: Checklist } }>(`/checklists/${id}`, data);
    return response.data.data.checklist;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/checklists/${id}`);
  },

  async createItem(data: ChecklistItemFormData): Promise<void> {
    await api.post('/checklist-items', data);
  },

  async updateItem(id: string, data: Partial<ChecklistItemFormData>): Promise<void> {
    await api.patch(`/checklist-items/${id}`, data);
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/checklist-items/${id}`);
  },
};
