export type ActivityType = 'CALL' | 'MEETING' | 'EMAIL' | 'NOTE' | 'TASK' | 'DOCUMENT_UPLOAD' | 'STAGE_CHANGE';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string };
  contactId?: string;
  contact?: { id: string; firstName: string; lastName: string };
  dealId?: string;
  deal?: { id: string; name: string };
  createdAt: string;
}

export interface ActivityFormData {
  type: ActivityType;
  description: string;
  contactId?: string;
  dealId?: string;
}
