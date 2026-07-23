export interface ApplicantSummary {
  id: string;
  fullName: string;
  email: string;
  country: string;
  track: string;
  status: string;
}

export interface Applicant extends ApplicantSummary {
  
  phone?: string;
  appliedAt?: string;
  notes?: string | null;
}

export interface ApplicantsMeta {
  total: number;
  totalPages: number;
  page: number;
}

export interface ApplicantsResponse {
  data: ApplicantSummary[];
  meta: ApplicantsMeta;
}


export interface DashboardSummary {
  total?: number;
  byStatus?: Record<string, number>;
  [key: string]: unknown;
}

export type SortField = 'fullName' | 'track' | 'country' | 'status';
export type SortDirection = 'asc' | 'desc';