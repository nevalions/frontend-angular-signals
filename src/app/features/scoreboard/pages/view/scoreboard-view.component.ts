import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { ComprehensiveMatchData, PlayerMatchWithDetails } from '../../../matches/models/comprehensive-match.model';
import { GameClock } from '../../../matches/models/gameclock.model';
import { PlayClock } from '../../../matches/models/playclock.model';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { FootballStartRosterDisplayComponent } from '../../components/roster-display/football-start-roster-display/football-start-roster-display.component';
import { MatchStoreService } from '../../../matches/services/match-store.service';
import { MatchStats, TeamStats } from '../../../matches/models/match-stats.model';
import { PlayerMatchLowerDisplayComponent } from '../../components/lower-display/player-match-lower-display/player-match-lower-display.component';
import { FootballQbLowerStatsDisplayComponent } from '../../components/lower-display/football-qb-lower-stats-display/football-qb-lower-stats-display.component';
import { TeamMatchLowerFootballStatsDisplayComponent } from '../../components/lower-display/team-match-lower-football-stats-display/team-match-lower-football-stats-display.component';

@Component({
  selector: 'app-scoreboard-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ScoreboardDisplayComponent,
    FootballStartRosterDisplayComponent,
    PlayerMatchLowerDisplayComponent,
    FootballQbLowerStatsDisplayComponent,
    TeamMatchLowerFootballStatsDisplayComponent,
  ],
  templateUrl: './scoreboard-view.component.html',
  styleUrl: './scoreboard-view.component.less',
})
export class ScoreboardViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private scoreboardStore = inject(ScoreboardStoreService);
  private matchStore = inject(MatchStoreService);

  matchId = createNumberParamSignal(this.route, 'matchId');

  // Data signals
  protected readonly data = signal<ComprehensiveMatchData | null>(null);
  protected readonly gameClock = signal<GameClock | null>(null);
  protected readonly playClock = signal<PlayClock | null>(null);
  protected readonly matchStats = signal<MatchStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Computed values
  protected readonly gameClockSeconds = computed(() => this.gameClock()?.gameclock ?? 0);
  protected readonly playClockSeconds = computed(() => this.playClock()?.playclock ?? null);

  // Tournament logo/sponsor (would come from tournament data)
  protected readonly tournamentLogo = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.tournament_logo_web_url || null;
  });

  protected readonly tournamentSponsorLogo = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.main_sponsor?.logo_url || null;
  });

  protected readonly scoreboard = computed(() => this.data()?.scoreboard ?? null);

  protected readonly teamAName = computed(() => {
    const sb = this.scoreboard();
    const data = this.data();
    if (sb?.use_team_a_game_title && sb.team_a_game_title) {
      return sb.team_a_game_title;
    }
    return data?.teams?.team_a?.title ?? 'Team A';
  });

  protected readonly teamBName = computed(() => {
    const sb = this.scoreboard();
    const data = this.data();
    if (sb?.use_team_b_game_title && sb.team_b_game_title) {
      return sb.team_b_game_title;
    }
    return data?.teams?.team_b?.title ?? 'Team B';
  });

  protected readonly teamAColor = computed(() => {
    const scoreboard = this.scoreboard();
    const teamColor = this.data()?.teams?.team_a?.team_color;
    if (scoreboard?.use_team_a_game_color) {
      return scoreboard.team_a_game_color ?? teamColor ?? '#1a1a1a';
    }
    return teamColor ?? scoreboard?.team_a_game_color ?? '#1a1a1a';
  });

  protected readonly teamBColor = computed(() => {
    const scoreboard = this.scoreboard();
    const teamColor = this.data()?.teams?.team_b?.team_color;
    if (scoreboard?.use_team_b_game_color) {
      return scoreboard.team_b_game_color ?? teamColor ?? '#1a1a1a';
    }
    return teamColor ?? scoreboard?.team_b_game_color ?? '#1a1a1a';
  });

  protected readonly playerLowerData = computed<PlayerMatchWithDetails | null>(() => {
    const playerId = this.scoreboard()?.player_match_lower_id ?? null;
    const players = this.data()?.players ?? [];
    return playerId ? players.find((player) => player.id === playerId) ?? null : null;
  });

  protected readonly qbLowerData = computed<PlayerMatchWithDetails | null>(() => {
    const qbId = this.scoreboard()?.football_qb_full_stats_match_lower_id ?? null;
    const players = this.data()?.players ?? [];
    return qbId ? players.find((player) => player.id === qbId) ?? null : null;
  });

  protected readonly playerLowerAlignment = computed(() => {
    const teamId = this.playerLowerData()?.team?.id ?? this.playerLowerData()?.team_id ?? null;
    const awayId = this.data()?.teams?.team_b?.id ?? null;
    return teamId && awayId && teamId === awayId ? 'away' : 'home';
  });

  protected readonly qbLowerAlignment = computed(() => {
    const teamId = this.qbLowerData()?.team?.id ?? this.qbLowerData()?.team_id ?? null;
    const awayId = this.data()?.teams?.team_b?.id ?? null;
    return teamId && awayId && teamId === awayId ? 'away' : 'home';
  });

  protected readonly showPlayerLower = computed(() => {
    return (this.scoreboard()?.is_match_player_lower ?? false) && this.playerLowerData() !== null;
  });

  protected readonly showQbLower = computed(() => {
    return (this.scoreboard()?.is_football_qb_full_stats_lower ?? false) && this.qbLowerData() !== null;
  });

  protected readonly showHomeTeamLower = computed(() => this.scoreboard()?.is_home_match_team_lower ?? false);
  protected readonly showAwayTeamLower = computed(() => this.scoreboard()?.is_away_match_team_lower ?? false);

  protected readonly homeTeamStats = computed(() => this.getTeamStats(this.data()?.teams?.team_a?.id ?? null));
  protected readonly awayTeamStats = computed(() => this.getTeamStats(this.data()?.teams?.team_b?.id ?? null));

  protected readonly qbTeamStats = computed(() => {
    const teamId = this.qbLowerData()?.team?.id ?? this.qbLowerData()?.team_id ?? null;
    return this.getTeamStats(teamId);
  });

  ngOnInit(): void {
    this.loadData();
    // TODO: Setup WebSocket connection for real-time updates
  }

  private loadData(): void {
    const id = this.matchId();
    if (!id) {
      this.error.set('Invalid match ID');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Load comprehensive match data
    this.scoreboardStore.getComprehensiveMatchData(id).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load match data');
        this.loading.set(false);
      },
    });

    // Load game clock
    this.scoreboardStore.getGameClock(id).subscribe({
      next: (clock) => this.gameClock.set(clock),
      error: () => console.error('Failed to load game clock'),
    });

    // Load play clock
    this.scoreboardStore.getPlayClock(id).subscribe({
      next: (clock) => this.playClock.set(clock),
      error: () => console.error('Failed to load play clock'),
    });

    // Load match stats for lower displays
    this.matchStore.getMatchStats(id).subscribe({
      next: (stats) => this.matchStats.set(stats),
      error: () => console.error('Failed to load match stats'),
    });
  }

  private getTeamStats(teamId: number | null): TeamStats | null {
    if (!teamId) {
      return null;
    }

    const stats = this.matchStats();
    if (!stats) {
      return null;
    }

    if (stats.team_a?.id === teamId) {
      return stats.team_a;
    }

    if (stats.team_b?.id === teamId) {
      return stats.team_b;
    }

    return null;
  }
}
