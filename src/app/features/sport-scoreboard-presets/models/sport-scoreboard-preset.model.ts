import { SportPeriodMode } from '../../matches/models/scoreboard.model';

export interface SportScoreboardPreset {
  id: number;
  title: string;
  gameclock_max: number | null;
  direction: 'down' | 'up';
  on_stop_behavior: 'hold' | 'reset';
  is_qtr: boolean;
  is_time: boolean;
  is_playclock: boolean;
  is_downdistance: boolean;
  has_timeouts: boolean;
  has_playclock: boolean;
  period_mode: SportPeriodMode;
  period_labels_json: string[] | null;
}

export interface SportScoreboardPresetCreate {
  title: string;
  gameclock_max?: number | null;
  direction?: 'down' | 'up';
  on_stop_behavior?: 'hold' | 'reset';
  is_qtr?: boolean;
  is_time?: boolean;
  is_playclock?: boolean;
  is_downdistance?: boolean;
  has_timeouts?: boolean;
  has_playclock?: boolean;
  period_mode?: SportPeriodMode;
  period_labels_json?: string[] | null;
}

export interface SportScoreboardPresetUpdate {
  title?: string | null;
  gameclock_max?: number | null;
  direction?: 'down' | 'up' | null;
  on_stop_behavior?: 'hold' | 'reset' | null;
  is_qtr?: boolean | null;
  is_time?: boolean | null;
  is_playclock?: boolean | null;
  is_downdistance?: boolean | null;
  has_timeouts?: boolean | null;
  has_playclock?: boolean | null;
  period_mode?: SportPeriodMode | null;
  period_labels_json?: string[] | null;
}
