import api from './api';
import { Deal, DealFormData, DealStage, DealStats } from '../types/deal';

export const dealService = {
  async getAll(): Promise<Deal[]> {
    const response = await api.get<{ status: string; data: { deals: Deal[] } }>('/deals');
    return response.data.data.deals;
  },

  async getById(id: string): Promise<Deal> {
    const response = await api.get<{ status: string; data: { deal: Deal } }>(`/deals/${id}`);
    return response.data.data.deal;
  },

  async create(data: DealFormData): Promise<Deal> {
    const response = await api.post<{ status: string; data: { deal: Deal } }>('/deals', data);
    return response.data.data.deal;
  },

  async update(id: string, data: Partial<DealFormData>): Promise<Deal> {
    const response = await api.put<{ status: string; data: { deal: Deal } }>(`/deals/${id}`, data);
    return response.data.data.deal;
  },

  async updateStage(id: string, stage: DealStage): Promise<Deal> {
    const response = await api.patch<{ status: string; data: { deal: Deal } }>(`/deals/${id}/stage`, { stage });
    return response.data.data.deal;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/deals/${id}`);
  },

  async getStats(): Promise<DealStats> {
    const response = await api.get<{ status: string; data: DealStats }>('/deals/stats');
    return response.data.data;
  },
};
