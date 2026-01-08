export interface Position {
  id: number;
  title: string;
  category?: string | null;
  sport_id: number;
}

export interface PositionCreate {
  title: string;
  category?: string | null;
  sport_id: number;
}

export interface PositionUpdate {
  title?: string;
  category?: string | null;
  sport_id?: number;
}
