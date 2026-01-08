export interface TeamTournament {
  id: number;
  tournament_id: number;
  team_id: number;
}

export interface TeamTournamentCreate {
  tournament_id: number;
  team_id: number;
}

export interface TeamTournamentUpdate {
  tournament_id?: number;
  team_id?: number;
}
