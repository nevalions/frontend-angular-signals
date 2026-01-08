export interface MatchData {
  id: number;
  field_length?: number | null;
  score_team_a?: number | null;
  score_team_b?: number | null;
  game_status?: string | null;
  timeout_team_a?: string | null;
  timeout_team_b?: string | null;
  qtr?: string | null;
  ball_on?: number | null;
  down?: string | null;
  distance?: string | null;
  match_id: number;
}

export interface MatchDataCreate {
  field_length?: number | null;
  score_team_a?: number | null;
  score_team_b?: number | null;
  game_status?: string | null;
  timeout_team_a?: string | null;
  timeout_team_b?: string | null;
  qtr?: string | null;
  ball_on?: number | null;
  down?: string | null;
  distance?: string | null;
  match_id: number;
}

export interface MatchDataUpdate {
  field_length?: number | null;
  score_team_a?: number | null;
  score_team_b?: number | null;
  game_status?: string | null;
  timeout_team_a?: string | null;
  timeout_team_b?: string | null;
  qtr?: string | null;
  ball_on?: number | null;
  down?: string | null;
  distance?: string | null;
}
