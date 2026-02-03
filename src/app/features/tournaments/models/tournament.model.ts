import { Tournament, Team, Sport, Sponsor, SponsorLine, Season } from '../../../shared/types';

export type { Tournament, Team, Sport, Sponsor, SponsorLine, Season };

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
  isprivate?: boolean;
  user_id?: number | null;
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
  isprivate?: boolean;
  user_id?: number | null;
}

export interface MoveTournamentConflictEntry {
  entity_id: number;
  tournament_ids: number[];
}

export interface MoveTournamentConflicts {
  teams: MoveTournamentConflictEntry[];
  players: MoveTournamentConflictEntry[];
}

export interface MoveTournamentUpdatedCounts {
  tournament: number;
  teams: number;
  players: number;
  player_team_tournaments: number;
  player_matches: number;
}

export interface MoveTournamentMissingPosition {
  title: string;
  source_position_id: number | null;
  entity: 'player_team_tournament' | 'player_match';
  record_id: number;
}

export interface MoveTournamentToSportRequest {
  target_sport_id: number;
  preview?: boolean;
  move_conflicting_tournaments?: boolean;
}

export interface MoveTournamentToSportResponse {
  moved: boolean;
  preview: boolean;
  updated_counts: MoveTournamentUpdatedCounts;
  conflicts: MoveTournamentConflicts;
  missing_positions: MoveTournamentMissingPosition[];
  moved_tournaments: number[];
}

import { PaginatedResponse } from '../../../core/models';

export interface TournamentWithDetails extends Tournament {
  season: Season | null;
  sport: Sport | null;
  teams: Team[];
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}

export type TournamentsPaginatedWithDetailsResponse = PaginatedResponse<TournamentWithDetails>;
