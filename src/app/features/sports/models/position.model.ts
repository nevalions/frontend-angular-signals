export interface Position {
  id: number;
  title: string;
  sport_id: number;
}

export interface PositionCreate {
  title: string;
  sport_id: number;
}

export interface PositionUpdate {
  title?: string;
  sport_id?: number;
}
