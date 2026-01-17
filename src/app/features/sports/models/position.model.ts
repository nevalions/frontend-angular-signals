import { Position } from '../../../shared/types';

export type { Position };

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
