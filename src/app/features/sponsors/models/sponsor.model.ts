import { Sponsor } from '../../../shared/types';
import { PaginatedResponse } from '../../../core/models';

export type { Sponsor };

export interface SponsorCreate {
  title: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}

export interface SponsorUpdate {
  title?: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}

export type SponsorsPaginatedResponse = PaginatedResponse<Sponsor>;
