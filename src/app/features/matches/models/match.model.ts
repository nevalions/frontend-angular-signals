export interface Match {
  id: number;
  match_date?: string | null;
  week?: number | null;
  match_eesl_id?: number | null;
  team_a_id: number;
  team_b_id: number;
  tournament_id?: number | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
}

export interface MatchCreate {
  match_date?: string | null;
  week?: number | null;
  match_eesl_id?: number | null;
  team_a_id: number;
  team_b_id: number;
  tournament_id?: number | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
}

export interface MatchUpdate {
  match_date?: string | null;
  week?: number | null;
  match_eesl_id?: number | null;
  team_a_id?: number;
  team_b_id?: number;
  tournament_id?: number | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
}

export interface PaginationMetadata {
  page: number;
  items_per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface MatchesPaginatedResponse {
  data: Match[];
  metadata: PaginationMetadata;
}
