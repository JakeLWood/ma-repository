import { Company } from './company';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedin?: string;
  notes?: string;
  companyId?: string;
  company?: { id: string; name: string } | Company;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedin?: string;
  notes?: string;
  companyId?: string;
}
