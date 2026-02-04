import { PaginatedResponse } from '../../../core/models';

export interface SponsorLine {
  id: number;
  title?: string | null;
  is_visible?: boolean | null;
}

export interface SponsorLineCreate {
  title?: string | null;
  is_visible?: boolean | null;
}

export interface SponsorLineUpdate {
  title?: string | null;
  is_visible?: boolean | null;
}

export type SponsorLinesPaginatedResponse = PaginatedResponse<SponsorLine>;
