import { Person, Position, Team } from '../../../shared/types';

export interface MatchAvailablePlayer {
  id: number;
  player_id: number;
  player_team_tournament: {
    id: number;
    player_team_tournament_eesl_id?: number | null;
    player_id?: number | null;
    team_id?: number | null;
    tournament_id?: number | null;
    player_number?: string | null;
    player_type?: string | null;
  } | null;
  person?: Person | null;
  position?: Position | null;
  team?: Team | null;
}
