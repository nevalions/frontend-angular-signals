import { SportPeriodMode } from '../../matches/models/scoreboard.model';

export type InitialTimeMode = 'max' | 'zero' | 'min';

export interface SportScoreboardPreset {
  id: number;
  title: string;
  gameclock_max: number | null;
  initial_time_mode: InitialTimeMode;
  initial_time_min_seconds: number | null;
  direction: 'down' | 'up';
  on_stop_behavior: 'hold' | 'reset';
  is_qtr: boolean;
  is_time: boolean;
  is_playclock: boolean;
  is_downdistance: boolean;
  has_timeouts: boolean;
  has_playclock: boolean;
  period_mode: SportPeriodMode;
  period_count: number;
  period_labels_json: string[] | null;
  default_playclock_seconds: number | null;
}

export interface SportScoreboardPresetCreate {
  title: string;
  gameclock_max?: number | null;
  initial_time_mode?: InitialTimeMode;
  initial_time_min_seconds?: number | null;
  direction?: 'down' | 'up';
  on_stop_behavior?: 'hold' | 'reset';
  is_qtr?: boolean;
  is_time?: boolean;
  is_playclock?: boolean;
  is_downdistance?: boolean;
  has_timeouts?: boolean;
  has_playclock?: boolean;
  period_mode?: SportPeriodMode;
  period_count?: number;
  period_labels_json?: string[] | null;
  default_playclock_seconds?: number | null;
}

export interface SportScoreboardPresetUpdate {
  title?: string | null;
  gameclock_max?: number | null;
  initial_time_mode?: InitialTimeMode | null;
  initial_time_min_seconds?: number | null;
  direction?: 'down' | 'up' | null;
  on_stop_behavior?: 'hold' | 'reset' | null;
  is_qtr?: boolean | null;
  is_time?: boolean | null;
  is_playclock?: boolean | null;
  is_downdistance?: boolean | null;
  has_timeouts?: boolean | null;
  has_playclock?: boolean | null;
  period_mode?: SportPeriodMode | null;
  period_count?: number | null;
  period_labels_json?: string[] | null;
  default_playclock_seconds?: number | null;
}
