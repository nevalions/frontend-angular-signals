import { PaginatedResponse } from '../../../core/models';

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
  isprivate: boolean;
  user_id?: number | null;
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
  isprivate?: boolean;
  user_id?: number | null;
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
  isprivate?: boolean;
  user_id?: number | null;
}

export type MatchesPaginatedResponse = PaginatedResponse<Match>;

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
  isprivate: boolean;
  user_id?: number | null;
}

export interface MatchWithDetails extends Match {
  team_a: Team | null;
  team_b: Team | null;
  tournament: Tournament | null;
}

export type MatchesPaginatedWithDetailsResponse = PaginatedResponse<MatchWithDetails>;

export interface FootballOffenseStats {
  id: number;
  pass_attempts: number;
  pass_received: number;
  pass_yards: number;
  pass_td: number;
  run_attempts: number;
  run_yards: number;
  run_avr: number;
  run_td: number;
  fumble: number;
}

export interface FootballQBStats {
  id: number;
  passes: number;
  passes_completed: number;
  pass_yards: number;
  pass_td: number;
  pass_avr: number;
  run_attempts: number;
  run_yards: number;
  run_td: number;
  run_avr: number;
  fumble: number;
  interception: number;
  qb_rating: number;
}

export interface FootballDefenseStats {
  id: number;
  tackles: number;
  assist_tackles: number;
  sacks: number;
  interceptions: number;
  fumble_recoveries: number;
  flags: number;
}

export interface FootballTeamStats {
  id: number;
  offence_yards: number;
  pass_att: number;
  run_att: number;
  avg_yards_per_att: number;
  pass_yards: number;
  run_yards: number;
  lost_yards: number;
  flag_yards: number;
  third_down_attempts: number;
  third_down_conversions: number;
  fourth_down_attempts: number;
  fourth_down_conversions: number;
  first_down_gained: number;
  turnovers: number;
}
