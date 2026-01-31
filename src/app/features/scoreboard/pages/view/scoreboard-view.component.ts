import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { ScoreboardClockService } from '../../services/scoreboard-clock.service';
import { ComprehensiveMatchData, PlayerMatchWithDetails } from '../../../matches/models/comprehensive-match.model';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { FootballStartRosterDisplayComponent } from '../../components/roster-display/football-start-roster-display/football-start-roster-display.component';
import { MatchStoreService } from '../../../matches/services/match-store.service';
import { TeamStats } from '../../../matches/models/match-stats.model';
import { PlayerMatchLowerDisplayComponent } from '../../components/lower-display/player-match-lower-display/player-match-lower-display.component';
import { FootballQbLowerStatsDisplayComponent } from '../../components/lower-display/football-qb-lower-stats-display/football-qb-lower-stats-display.component';
import { TeamMatchLowerFootballStatsDisplayComponent } from '../../components/lower-display/team-match-lower-football-stats-display/team-match-lower-football-stats-display.component';
import { SponsorLineComponent } from '../../components/sponsor-display/sponsor-line.component';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { PlayByPlayComponent } from '../../components/play-by-play/play-by-play.component';

@Component({
  selector: 'app-scoreboard-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ScoreboardDisplayComponent,
    FootballStartRosterDisplayComponent,
    PlayerMatchLowerDisplayComponent,
    FootballQbLowerStatsDisplayComponent,
    TeamMatchLowerFootballStatsDisplayComponent,
    SponsorLineComponent,
    PlayByPlayComponent,
  ],
  templateUrl: './scoreboard-view.component.html',
  styleUrl: './scoreboard-view.component.less',
})
export class ScoreboardViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private scoreboardStore = inject(ScoreboardStoreService);
  private clockService = inject(ScoreboardClockService);
  private matchStore = inject(MatchStoreService);
  private wsService = inject(WebSocketService);

  matchId = createNumberParamSignal(this.route, 'matchId');

  // Data signals
  protected readonly data = signal<ComprehensiveMatchData | null>(null);
  protected readonly matchStats = computed(() => this.wsService.statistics());
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Computed values
  protected readonly gameClockSeconds = computed(() => this.clockService.predictedGameClock());
  protected readonly playClockDisplay = signal<number | null>(null);
  private playClockClearTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private playClockHoldActive = signal<boolean>(false);

  // Tournament logo/sponsor (would come from tournament data)
  protected readonly tournamentLogo = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.tournament_logo_web_url || null;
  });

  protected readonly tournamentSponsorLogo = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.main_sponsor?.logo_url || null;
  });

  protected readonly mainSponsor = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.main_sponsor ?? null;
  });

  protected readonly mainSponsorLine = computed(() => {
    const sponsor = this.mainSponsor();
    if (!sponsor) return null;
    
    return {
      id: sponsor.id,
      title: sponsor.title,
      is_visible: true,
    };
  });

  protected readonly scoreboard = computed(() => this.data()?.scoreboard ?? null);

  protected readonly showMainSponsor = computed(() => this.scoreboard()?.is_main_sponsor ?? false);
  protected readonly showMatchSponsorLine = computed(() => this.scoreboard()?.is_match_sponsor_line ?? false);

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

  // Effects must be created in injection context (constructor/field initializer)
  // Use untracked() to prevent infinite loop - we only want to react to wsService changes
  
  // Handle initial-load message: sets all data at once
  private wsMatchDataEffect = effect(() => {
    const message = this.wsService.matchData();
    if (!message) {
      return;
    }

    // Use untracked to read current data without creating dependency
    const current = untracked(() => this.data());

    // Handle initial-load message: use as initial dataset if current is null and has teams
    if (!current && message['teams']) {
      this.data.set({
        ...message,
        players: message['players'] || [],
        events: message['events'] || [],
      } as unknown as ComprehensiveMatchData);
      this.loading.set(false);
      return;
    }

    // Skip if no current data yet (waiting for initial-load or HTTP load)
    if (!current) {
      return;
    }

    // Note: Subsequent updates (match_data, scoreboard) are handled by partial effects
    // Don't merge here to avoid type conflicts and data loss
  });

  // Handle partial match_data updates (e.g., score, quarter changes)
  private wsMatchDataPartialEffect = effect(() => {
    const partial = this.wsService.matchDataPartial();
    if (!partial) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Merge only match_data field
    this.data.set({
      ...current,
      match_data: partial,
    });
  });

  // Handle partial scoreboard_data updates (e.g., scoreboard settings)
  private wsScoreboardPartialEffect = effect(() => {
    const partial = this.wsService.scoreboardPartial();
    if (!partial) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Merge only scoreboard field
    this.data.set({
      ...current,
      scoreboard: partial as ComprehensiveMatchData['scoreboard'],
    });
  });

  // Handle partial match updates (team IDs, dates, sponsors)
  private wsMatchPartialEffect = effect(() => {
    const partial = this.wsService.matchPartial();
    if (!partial) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Merge match field
    this.data.set({
      ...current,
      match: partial,
    });
  });

  // Handle partial teams updates (colors, logos, names)
  private wsTeamsPartialEffect = effect(() => {
    const partial = this.wsService.teamsPartial();
    if (!partial) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Merge teams field
    this.data.set({
      ...current,
      teams: partial,
    });
  });

  // Handle players updates (from match-update messages)
  private wsPlayersFromMatchUpdateEffect = effect(() => {
    const players = this.wsService.playersPartial();
    if (!players) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Merge players only if different
    if (JSON.stringify(current.players) !== JSON.stringify(players)) {
      this.data.set({
        ...current,
        players,
      });
    }
  });

  // Handle events updates (from match-update messages)
  private wsEventsFromMatchUpdateEffect = effect(() => {
    const events = this.wsService.eventsPartial();
    if (!events) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Merge events only if different
    if (JSON.stringify(current.events) !== JSON.stringify(events)) {
      this.data.set({
        ...current,
        events,
      });
    }
  });

  // Handle events updates (from event-update messages)
  private wsEventsEffect = effect(() => {
    const events = this.wsService.events();
    const current = untracked(() => this.data());
    if (!current) return;

    // Merge events only if different
    if (JSON.stringify(current.events) !== JSON.stringify(events)) {
      this.data.set({
        ...current,
        events: [...events],
      });
    }
  });

  private syncPlayClockDisplay = effect(() => {
    const pc = this.clockService.playClock();
    const status = pc?.playclock_status ?? null;
    const predicted = this.clockService.predictedPlayClock();
    const seconds = status === 'running' ? predicted : pc?.playclock ?? null;

    if (seconds == null) {
      if (this.playClockHoldActive()) {
        this.playClockDisplay.set(0);
        return;
      }
      this.clearPlayClockTimeout();
      this.playClockDisplay.set(null);
      return;
    }

    if (seconds == null || seconds > 0) {
      this.clearPlayClockTimeout();
      this.playClockHoldActive.set(false);
      this.playClockDisplay.set(seconds);
      return;
    }

    this.playClockDisplay.set(0);

    if (this.playClockClearTimeoutId == null) {
      this.playClockHoldActive.set(true);
      this.playClockClearTimeoutId = setTimeout(() => {
        const latest = this.clockService.playClock();
        const latestStatus = latest?.playclock_status ?? null;
        const latestPredicted = this.clockService.predictedPlayClock();
        const latestSeconds = latestStatus === 'running' ? latestPredicted : latest?.playclock ?? null;
        if (latestSeconds === 0) {
          this.playClockDisplay.set(null);
        }
        this.playClockHoldActive.set(false);
        this.playClockClearTimeoutId = null;
      }, 3000);
    }
  });

  ngOnInit(): void {
    this.connectWebSocket();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.clearPlayClockTimeout();
    this.wsService.disconnect();
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

    // Data will be loaded via WebSocket initial-load message
    // No HTTP calls needed here
  }

  private connectWebSocket(): void {
    const id = this.matchId();
    if (!id) {
      return;
    }

    this.wsService.connect(id);
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

  private clearPlayClockTimeout(): void {
    if (this.playClockClearTimeoutId != null) {
      clearTimeout(this.playClockClearTimeoutId);
      this.playClockClearTimeoutId = null;
    }
    this.playClockHoldActive.set(false);
  }
}
