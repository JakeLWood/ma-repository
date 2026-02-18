import api from './api';
import type { Contact, ContactFormData } from '../types/contact';

export const contactService = {
  async getAll(): Promise<Contact[]> {
    const response = await api.get<{ status: string; data: { contacts: Contact[] } }>('/contacts');
    return response.data.data.contacts;
  },

  async getById(id: string): Promise<Contact> {
    const response = await api.get<{ status: string; data: { contact: Contact } }>(`/contacts/${id}`);
    return response.data.data.contact;
  },

  async create(data: ContactFormData): Promise<Contact> {
    const response = await api.post<{ status: string; data: { contact: Contact } }>('/contacts', data);
    return response.data.data.contact;
  },

  async update(id: string, data: Partial<ContactFormData>): Promise<Contact> {
    const response = await api.put<{ status: string; data: { contact: Contact } }>(`/contacts/${id}`, data);
    return response.data.data.contact;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`);
  },
};
