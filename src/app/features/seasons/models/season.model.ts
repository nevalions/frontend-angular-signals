export interface Season {
  id: number;
  year: number;
  description?: string | null;
}

export interface SeasonCreate {
  year: number;
  description?: string | null;
}

export interface SeasonUpdate {
  year?: number;
  description?: string | null;
}
