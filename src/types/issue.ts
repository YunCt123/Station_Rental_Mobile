export interface IssueResolution {
  solution_description?: string;
  resolution_actions?: string[];
  resolved_by?: string;              // user_id
  resolved_at?: string;              // ISO date
  resolution_notes?: string;
  resolution_photos?: string[];
  customer_satisfaction?: 'SATISFIED' | 'NEUTRAL' | 'UNSATISFIED' | 'NOT_RATED';
  follow_up_required?: boolean;
  estimated_cost?: number;
  actual_cost?: number;
}

export interface IssueModel {
  _id: string;

  reporter_id?: string;
  rental_id?: string;
  vehicle_id?: string;
  station_id?: string;

  title: string;
  description?: string;
  photos?: string[];

  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

  resolution?: IssueResolution;

  assigned_to?: string;

  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueRequest {
  reporter_id?: string;
  rental_id?: string;
  vehicle_id?: string;
  station_id?: string;

  title: string;
  description?: string;
  photos?: string[];

  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  photos?: string[];

  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

  assigned_to?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  resolution?: IssueResolution;
}
