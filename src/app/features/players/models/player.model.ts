import { PaginatedResponse } from '../../../core/models';
import { Person, Sport, Team, Tournament, Position } from '../../../shared/types';

export type { Person, Sport, Team, Tournament, Position };

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

export interface PlayerWithDetailsAndPhotos extends PlayerWithNames {
  person_photo_url: string | null;
  person_photo_icon_url: string | null;
}

export type PaginatedPlayerWithDetailsAndPhotosResponse = PaginatedResponse<PlayerWithDetailsAndPhotos>;

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

export interface PlayerCareer {
  career_by_team: CareerByTeam[];
  career_by_tournament: CareerByTournament[];
}

export interface PlayerDetailInTournamentResponse {
  id: number;
  sport_id: number;
  person: {
    first_name: string;
    second_name: string;
    person_dob: string;
    person_eesl_id: number;
    person_photo_url: string | null;
    person_photo_icon_url: string | null;
    person_photo_web_url: string | null;
  };
  sport: {
    id: number;
    title: string;
    description: string | null;
  };
  tournament_assignment: {
    team_title: string;
    team_id: number;
    position_title: string;
    position_id: number;
    player_number: string | null;
    tournament_title: string;
    tournament_year: string;
    tournament_id: number;
  };
  career_by_team: CareerByTeam[];
  career_by_tournament: CareerByTournament[];
}

export interface CareerByTeam {
  team_id: number;
  team_title: string;
  assignments: PlayerTeamTournament[];
}

export interface CareerByTournament {
  tournament_id: number;
  tournament_title: string;
  season_id: number;
  season_year: number;
  assignments: PlayerTeamTournament[];
}

export interface PlayerTeamTournamentWithDetailsAndPhotos {
  id: number;
  player_team_tournament_eesl_id: number | null;
  player_number: string | null;
  team_id: number | null;
  team_title: string | null;
  position_id: number | null;
  position_title: string | null;
  tournament_id: number | null;
  player_id: number;
  first_name: string | null;
  second_name: string | null;
  person_photo_url: string | null;
  person_photo_icon_url: string | null;
}

export type PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse = PaginatedResponse<PlayerTeamTournamentWithDetailsAndPhotos>;
