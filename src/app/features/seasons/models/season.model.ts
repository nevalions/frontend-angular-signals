export interface Season {
  id: number;
  year: number;
  description?: string | null;
  iscurrent: boolean;
}

export interface SeasonCreate {
  year: number;
  description?: string | null;
  iscurrent?: boolean;
}

export interface SeasonUpdate {
  year?: number;
  description?: string | null;
  iscurrent?: boolean;
}
