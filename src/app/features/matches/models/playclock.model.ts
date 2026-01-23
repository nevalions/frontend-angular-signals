export interface PlayClock {
  id: number;
  playclock?: number | null;
  playclock_max?: number | null;
  playclock_status?: string | null;
  updated_at?: string | null;
  version?: number | null;
  match_id: number;
  
  started_at_ms?: number | null;
  server_time_ms?: number | null;
}

export interface PlayClockCreate {
  playclock?: number | null;
  playclock_status?: string | null;
  match_id: number;
}

export interface PlayClockUpdate {
  playclock?: number | null;
  playclock_status?: string | null;
}
