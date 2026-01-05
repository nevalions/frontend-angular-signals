export interface Tournament {
  id: number;
  title: string;
  season_id: number;
  sport_id: number;
  description?: string | null;
}

export interface TournamentCreate {
  title: string;
  season_id: number;
  sport_id: number;
  description?: string | null;
}

  export interface TournamentUpdate {
  title?: string | null;
  season_id?: number | null;
  sport_id?: number | null;
  description?: string | null;
}
