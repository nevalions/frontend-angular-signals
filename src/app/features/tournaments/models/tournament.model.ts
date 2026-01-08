export interface Tournament {
  id: number;
  tournament_eesl_id?: number | null;
  title: string;
  season_id: number;
  sport_id: number;
  description?: string | null;
  tournament_logo_url?: string | null;
  tournament_logo_icon_url?: string | null;
  tournament_logo_web_url?: string | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
}

export interface TournamentCreate {
  tournament_eesl_id?: number | null;
  title: string;
  season_id: number;
  sport_id: number;
  description?: string | null;
  tournament_logo_url?: string | null;
  tournament_logo_icon_url?: string | null;
  tournament_logo_web_url?: string | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
}

export interface TournamentUpdate {
  tournament_eesl_id?: number | null;
  title?: string;
  season_id?: number;
  sport_id?: number;
  description?: string | null;
  tournament_logo_url?: string | null;
  tournament_logo_icon_url?: string | null;
  tournament_logo_web_url?: string | null;
  main_sponsor_id?: number | null;
  sponsor_line_id?: number | null;
}
