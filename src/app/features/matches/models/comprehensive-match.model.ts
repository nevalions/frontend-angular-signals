import { MatchWithDetails } from './match.model';
import { MatchData } from './match-data.model';
import { PlayerMatch } from './player-match.model';
import { FootballEvent } from './football-event.model';
import { Team } from './match.model';

export interface ComprehensiveMatchData {
  match: MatchWithDetails;
  match_data: MatchData;
  teams: {
    team_a: Team;
    team_b: Team;
  };
  players: PlayerMatchWithDetails[];
  events: FootballEvent[];
  scoreboard: {
    id: number;
    match_id: number;
    scale_tournament_logo: number;
    scale_main_sponsor: number;
    scale_logo_a: number;
    scale_logo_b: number;
    team_a_game_color: string;
    team_b_game_color: string;
    team_a_game_title: string;
    team_b_game_title: string;
  } | null;
}

export interface PlayerMatchWithDetails extends PlayerMatch {
  player_id?: number | null;
  player?: {
    id: number;
    player_eesl_id?: number | null;
    person_id?: number | null;
    player_team_tournament_id?: number | null;
  } | null;
  team?: Team | null;
  position?: {
    id: number;
    title: string;
    category?: string | null;
  } | null;
  player_team_tournament?: {
    id: number;
    player_team_tournament_eesl_id?: number | null;
    player_id?: number | null;
    team_id?: number | null;
    tournament_id?: number | null;
    player_number?: string | null;
    player_type?: string | null;
  } | null;
  person?: {
    id: number;
    first_name: string;
    second_name: string;
    person_eesl_id?: number | null;
    photo_url?: string | null;
  } | null;
  is_starting?: boolean | null;
  starting_type?: string | null;
}
