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
}
