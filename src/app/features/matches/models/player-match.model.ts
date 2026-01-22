export interface PlayerMatch {
  id: number;
  player_match_eesl_id?: number | null;
  player_team_tournament_id?: number | null;
  match_id: number;
  team_id: number;
  match_position_id?: number | null;
  match_number?: string | null;
  is_start?: boolean | null;
  is_starting?: boolean | null;
  starting_type?: string | null;
}

export interface PlayerMatchCreate {
  player_match_eesl_id?: number | null;
  player_team_tournament_id?: number | null;
  match_id: number;
  team_id: number;
  match_position_id?: number | null;
  match_number?: string | null;
  is_start?: boolean | null;
  is_starting?: boolean | null;
  starting_type?: string | null;
}

export interface PlayerMatchUpdate {
  id?: number;
  player_match_eesl_id?: number | null;
  player_team_tournament_id?: number | null;
  team_id?: number;
  match_position_id?: number | null;
  match_number?: string | null;
  is_start?: boolean | null;
  is_starting?: boolean | null;
  starting_type?: string | null;
}
