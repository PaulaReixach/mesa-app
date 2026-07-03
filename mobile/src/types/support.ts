export type SupportRequestCategory =
  | 'TECHNICAL_PROBLEM'
  | 'ACCOUNT'
  | 'SUGGESTION'
  | 'OTHER';

export type SupportRequestStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type CreateSupportRequestPayload = {
  category: SupportRequestCategory;
  subject: string;
  message: string;
};

export type SupportRequestResponse = {
  id: string;
  category: SupportRequestCategory;
  subject: string;
  status: SupportRequestStatus;
  createdAt: string;
};