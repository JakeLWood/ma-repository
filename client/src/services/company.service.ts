import api from './api';
import type { Company, CompanyFormData } from '../types/company';

export const companyService = {
  async getAll(): Promise<Company[]> {
    const response = await api.get<{ status: string; data: { companies: Company[] } }>('/companies');
    return response.data.data.companies;
  },

  async getById(id: string): Promise<Company> {
    const response = await api.get<{ status: string; data: { company: Company } }>(`/companies/${id}`);
    return response.data.data.company;
  },

  async create(data: CompanyFormData): Promise<Company> {
    const response = await api.post<{ status: string; data: { company: Company } }>('/companies', data);
    return response.data.data.company;
  },

  async update(id: string, data: Partial<CompanyFormData>): Promise<Company> {
    const response = await api.put<{ status: string; data: { company: Company } }>(`/companies/${id}`, data);
    return response.data.data.company;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  },
};
