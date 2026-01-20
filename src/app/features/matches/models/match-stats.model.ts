export interface MatchStats {
  match_id: number;
  team_a: TeamStats;
  team_b: TeamStats;
}

export interface TeamStats {
  id: number;
  team_stats: FootballTeamStats;
  offense_stats: FootballOffenseStats;
  qb_stats: FootballQBStats;
  defense_stats: FootballDefenseStats;
}

export interface FootballOffenseStats {
  pass_attempts: number;
  pass_received: number;
  pass_yards: number;
  pass_td: number;
  run_attempts: number;
  run_yards: number;
  run_avr: number;
  run_td: number;
  fumble: number;
}

export interface FootballQBStats {
  passes: number;
  passes_completed: number;
  pass_yards: number;
  pass_td: number;
  pass_avr: number;
  run_attempts: number;
  run_yards: number;
  run_td: number;
  run_avr: number;
  fumble: number;
  interception: number;
  qb_rating: number;
}

export interface FootballDefenseStats {
  tackles: number;
  assist_tackles: number;
  sacks: number;
  interceptions: number;
  fumble_recoveries: number;
  flags: number;
}

export interface FootballTeamStats {
  offence_yards: number;
  pass_att: number;
  run_att: number;
  avg_yards_per_att: number;
  pass_yards: number;
  run_yards: number;
  lost_yards: number;
  flag_yards: number;
  third_down_attempts: number;
  third_down_conversions: number;
  fourth_down_attempts: number;
  fourth_down_conversions: number;
  first_down_gained: number;
  turnovers: number;
}
