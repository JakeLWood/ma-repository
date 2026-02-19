import type { Company } from './company';
import type { User } from './auth';

export type DealStage = 'SOURCING' | 'SCREENING' | 'DUE_DILIGENCE' | 'NEGOTIATION' | 'CLOSING' | 'CLOSED';
export type DealStatus = 'ACTIVE' | 'WON' | 'LOST' | 'ON_HOLD';
export type DealType = 'ACQUISITION' | 'MERGER' | 'DIVESTITURE' | 'INVESTMENT';

export interface Deal {
  id: string;
  name: string;
  description?: string;
  stage: DealStage;
  status: DealStatus;
  dealType: DealType;
  companyId: string;
  company: { id: string; name: string } | Company;
  valuation?: number;
  dealAmount?: number;
  closeDate?: string;
  probability?: number;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email?: string } | User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    checklists: number;
  };
}

export interface DealFormData {
  name: string;
  description?: string;
  stage?: DealStage;
  status?: DealStatus;
  dealType?: DealType;
  companyId: string;
  valuation?: number;
  dealAmount?: number;
  closeDate?: string;
  probability?: number;
}

export interface DealStats {
  dealsByStage: { stage: DealStage; _count: number }[];
  dealsByStatus: { status: DealStatus; _count: number }[];
  totalDealValue: number;
}
