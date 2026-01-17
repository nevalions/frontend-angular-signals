import { Sport } from '../../../shared/types';

export type { Sport };

export interface SportCreate {
  title: string;
  description?: string | null;
}

export interface SportUpdate {
  title?: string;
  description?: string | null;
}
