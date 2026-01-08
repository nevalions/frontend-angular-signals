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
}

export interface LogoUploadResponse {
  original: string;
  icon: string;
  webview: string;
}

import { PaginatedResponse } from '../../../core/models';

export type TeamsPaginatedResponse = PaginatedResponse<Team>;
