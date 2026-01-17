import { Team, Sport, Sponsor, SponsorLine } from '../../../shared/types';
import { PaginatedResponse } from '../../../core/models';

export type { Team, Sport, Sponsor, SponsorLine };

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

export type TeamsPaginatedResponse = PaginatedResponse<Team>;

export interface TeamWithDetails extends Team {
  sport: Sport | null;
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}

export type TeamsPaginatedWithDetailsResponse = PaginatedResponse<TeamWithDetails>;
