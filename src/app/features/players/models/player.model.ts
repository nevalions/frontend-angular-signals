import { PaginatedResponse } from '../../../core/models';

export interface Person {
  id: number;
  first_name: string | null;
  second_name: string | null;
  person_photo_url: string | null;
  person_photo_web_url: string | null;
  person_photo_icon_url: string | null;
  person_eesl_id: number | null;
  owner_user_id: number | null;
  isprivate: boolean;
  person_dob: string | null;
}

export interface Player {
  id: number;
  sport_id: number | null;
  person_id: number | null;
  player_eesl_id: number | null;
  user_id: number | null;
  isprivate: boolean;
  first_name?: string | null;
  second_name?: string | null;
  player_team_tournaments?: PlayerTeamTournament[];
}

export interface PlayerWithPerson extends Player {
  person: Person;
}

export interface PlayerWithPersonAndTournaments extends PlayerWithPerson {
  player_team_tournaments?: PlayerTeamTournament[];
}

export interface PlayerWithNames extends Player {
  first_name: string | null;
  second_name: string | null;
  player_team_tournaments: PlayerTeamTournament[];
}

export interface PlayerTeamTournament {
  id: number;
  player_team_tournament_eesl_id: number | null;
  player_number: string | null;
  team_id: number | null;
  team_title: string | null;
  position_id: number | null;
  position_title: string | null;
  tournament_id: number | null;
}

export interface PlayerInTournament {
  id: number;
  player_team_tournament_eesl_id: number | null;
  player_id: number;
  player_number: string | null;
  team_id: number | null;
  team_title: string | null;
  position_id: number | null;
  position_title: string | null;
  tournament_id: number | null;
  first_name: string | null;
  second_name: string | null;
}

export interface PlayerTeamTournamentWithDetails {
  id: number;
  player_team_tournament_eesl_id: number | null;
  player_id: number;
  player_number: string | null;
  team_id: number | null;
  team_title: string | null;
  position_id: number | null;
  position_title: string | null;
  tournament_id: number | null;
  first_name: string | null;
  second_name: string | null;
  person_photo_url: string | null;
  person_photo_icon_url: string | null;
}

export type PlayersPaginatedResponse = PaginatedResponse<PlayerWithPerson>;
export type PlayerTeamTournamentWithDetailsPaginatedResponse = PaginatedResponse<PlayerInTournament>;
export type PaginatedPlayerWithDetailsResponse = PaginatedResponse<PlayerWithNames>;

export type PlayerSortBy = 'id' | 'first_name' | 'second_name' | 'player_eesl_id';

export interface PlayerAddToSport {
  person_id: number;
  sport_id: number;
  isprivate?: boolean | null;
  user_id?: number | null;
}

export interface RemovePersonFromSportResponse {
  success: boolean;
  message: string;
}

export interface Sport {
  id: number;
  title: string;
  description?: string | null;
}

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

export interface Position {
  id: number;
  title: string;
}

export interface PlayerTeamTournamentWithFullDetails {
  id: number;
  player_team_tournament_eesl_id: number | null;
  player_id: number;
  player_number: string | null;
  team: Team | null;
  tournament: Tournament | null;
  position: Position | null;
}

export interface PlayerWithFullDetails {
  id: number;
  sport_id: number | null;
  person_id: number | null;
  player_eesl_id: number | null;
  user_id: number | null;
  isprivate: boolean;
  person: Person | null;
  sport: Sport | null;
  player_team_tournaments: PlayerTeamTournamentWithFullDetails[];
}

export type PaginatedPlayerWithFullDetailsResponse = PaginatedResponse<PlayerWithFullDetails>;
export type PaginatedPlayerTeamTournamentWithFullDetailsResponse = PaginatedResponse<PlayerTeamTournamentWithFullDetails>;
