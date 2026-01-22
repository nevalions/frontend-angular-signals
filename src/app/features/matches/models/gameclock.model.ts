export interface GameClock {
  id: number;
  gameclock_time_remaining?: number | null;
  gameclock?: number | null;
  gameclock_max?: number | null;
  gameclock_status?: string | null;
  updated_at?: string | null;
  version?: number | null;
  match_id: number;
}

export interface GameClockCreate {
  gameclock_time_remaining?: number | null;
  gameclock?: number | null;
  gameclock_max?: number | null;
  gameclock_status?: string | null;
  match_id: number;
}

export interface GameClockUpdate {
  gameclock_time_remaining?: number | null;
  gameclock?: number | null;
  gameclock_max?: number | null;
  gameclock_status?: string | null;
}
