import api from './api';
import type { Activity, ActivityFormData } from '../types/activity';

export const activityService = {
  async getAll(): Promise<Activity[]> {
    const response = await api.get<{ status: string; data: { activities: Activity[] } }>('/activities');
    return response.data.data.activities;
  },

  async create(data: ActivityFormData): Promise<Activity> {
    const response = await api.post<{ status: string; data: { activity: Activity } }>('/activities', data);
    return response.data.data.activity;
  },

  async getDealActivities(dealId: string): Promise<Activity[]> {
    const response = await api.get<{ status: string; data: { activities: Activity[] } }>(`/deals/${dealId}/activities`);
    return response.data.data.activities;
  },

  async getContactActivities(contactId: string): Promise<Activity[]> {
    const response = await api.get<{ status: string; data: { activities: Activity[] } }>(`/deals/contacts/${contactId}/activities`);
    return response.data.data.activities;
  },
};
