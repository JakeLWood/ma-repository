export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  revenue?: number;
  employees?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
    deals: number;
  };
}

export interface CompanyFormData {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  revenue?: number;
  employees?: number;
  tags?: string[];
}
