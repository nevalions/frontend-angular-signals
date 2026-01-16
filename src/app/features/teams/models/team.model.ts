export interface Team {
  id: number;
  team_eesl_id?: number | null;
  title: string;
  city?: string | null;
  description?: string | null;
  team_logo_url?: string | null;
  team_logo_icon_url?: string | null;
  team_logo_web_url?: string | null;
  team_color: string;
  sponsor_line_id?: number | null;
  main_sponsor_id?: number | null;
  sport_id: number;
  isprivate: boolean;
  user_id?: number | null;
}

export interface TeamCreate {
  team_eesl_id?: number | null;
  title: string;
  city?: string | null;
  description?: string | null;
  team_logo_url?: string | null;
  team_logo_icon_url?: string | null;
  team_logo_web_url?: string | null;
  team_color?: string;
  sponsor_line_id?: number | null;
  main_sponsor_id?: number | null;
  sport_id: number;
  isprivate?: boolean;
  user_id?: number | null;
}

export interface TeamUpdate {
  team_eesl_id?: number | null;
  title?: string;
  city?: string | null;
  description?: string | null;
  team_logo_url?: string | null;
  team_logo_icon_url?: string | null;
  team_logo_web_url?: string | null;
  team_color?: string;
  sponsor_line_id?: number | null;
  main_sponsor_id?: number | null;
  sport_id?: number;
  isprivate?: boolean;
  user_id?: number | null;
}

export interface LogoUploadResponse {
  original: string;
  icon: string;
  webview: string;
}

import { PaginatedResponse } from '../../../core/models';

export type TeamsPaginatedResponse = PaginatedResponse<Team>;

export interface TeamWithDetails extends Team {
  sport: Sport | null;
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}

export type TeamsPaginatedWithDetailsResponse = PaginatedResponse<TeamWithDetails>;

export interface Sport {
  id: number;
  title: string;
  description?: string | null;
}

export interface Sponsor {
  id: number;
  title: string;
  logo_url?: string | null;
  scale_logo?: number | null;
}

export interface SponsorLine {
  id: number;
  title: string;
  is_visible?: boolean | null;
}
