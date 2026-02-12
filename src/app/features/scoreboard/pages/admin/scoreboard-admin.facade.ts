import { computed, effect, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';
import { FootballEventCreate, FootballEventUpdate } from '../../../matches/models/football-event.model';
import { PlayerMatchUpdate } from '../../../matches/models/player-match.model';
import { Scoreboard, ScoreboardUpdate } from '../../../matches/models/scoreboard.model';
import { ScoreboardClockService } from '../../services/scoreboard-clock.service';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { CollapsibleSectionService } from '../../components/admin-forms/collapsible-section/collapsible-section.service';
import { DownDistanceChangeEvent } from '../../components/admin-forms/down-distance-forms/down-distance-forms.component';
import { GameClockActionEvent, PlayClockActionEvent } from '../../components/admin-forms/time-forms/time-forms.component';
import { QuarterChangeEvent, ScoreChangeEvent, TimeoutChangeEvent } from '../../components/admin-forms/score-forms/score-forms.component';

@Injectable()
export class ScoreboardAdminFacade implements OnDestroy {
  private route = inject(ActivatedRoute);
  private scoreboardStore = inject(ScoreboardStoreService);
  private clockService = inject(ScoreboardClockService);
  private wsService = inject(WebSocketService);
  private readonly collapsibleSectionService = inject(CollapsibleSectionService);
  private readonly navigationHelper = inject(NavigationHelperService);

  readonly matchId = createNumberParamSignal(this.route, 'matchId');

  // Optional context (when navigated from match/tournament pages)
  readonly sportId = createNumberParamSignal(this.route, 'sportId', { source: 'queryParamMap' });
  readonly year = createNumberParamSignal(this.route, 'year', { source: 'queryParamMap' });
  readonly tournamentId = createNumberParamSignal(this.route, 'tournamentId', { source: 'queryParamMap' });

  // Data signals
  readonly data = signal<ComprehensiveMatchData | null>(null);
  readonly scoreboard = signal<Scoreboard | null>(null);
  readonly matchStats = computed(() => this.wsService.statistics());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly gameClock = computed(() => this.clockService.gameClock());
  readonly playClock = computed(() => this.clockService.playClock());
  readonly gameClockLocked = computed(() => this.clockService.gameClockActionLocked());
  readonly playClockLocked = computed(() => this.clockService.playClockActionLocked());

  readonly gameClockWithPredictedValue = computed(() => {
    const gc = this.clockService.gameClock();
    const predicted = this.clockService.predictedGameClock();
    if (!gc) return null;
    return { ...gc, gameclock: predicted };
  });

  readonly playClockWithPredictedValue = computed(() => {
    const pc = this.clockService.playClock();
    const predicted = this.clockService.predictedPlayClock();
    if (!pc) return null;
    return { ...pc, playclock: predicted };
  });

  // Display settings visibility signals
  readonly displaySettingsShowPlayClock = computed(() => {
    const sb = this.scoreboard();
    console.log('[Facade] Full scoreboard object:', sb);
    return sb?.has_playclock ?? false;
  });
  readonly displaySettingsShowDownDistance = computed(() => this.scoreboard()?.is_downdistance ?? false);
  readonly displaySettingsPeriodMode = computed(() => this.scoreboard()?.period_mode ?? 'qtr');

  // Workaround for missing has_timeouts in Match scoreboard schema
  private readonly hasTimeoutsCapability = computed(() => {
    const sb = this.scoreboard();
    return (sb?.is_timeout_team_a !== null) || (sb?.is_timeout_team_b !== null);
  });

  // Form visibility signals based on sport preset settings
  readonly showDownDistanceForm = computed(() => {
    const sb = this.scoreboard();
    console.log('[Facade] showDownDistanceForm - is_downdistance:', sb?.is_downdistance);
    return sb?.is_downdistance ?? false;
  });
  readonly showTimeoutControls = computed(() => {
    const sb = this.scoreboard();
    // WORKAROUND: has_timeouts doesn't exist in Match scoreboard schema
    // Use is_timeout_team_a or is_timeout_team_b as proxy
    const hasTimeouts = (sb?.is_timeout_team_a !== null) || (sb?.is_timeout_team_b !== null);
    console.log('[Facade] showTimeoutControls - is_timeout_team_a:', sb?.is_timeout_team_a, 'is_timeout_team_b:', sb?.is_timeout_team_b, 'hasTimeouts:', hasTimeouts);
    return hasTimeouts;
  });
  readonly showPlayClockSection = computed(() => {
    const sb = this.scoreboard();
    console.log('[Facade] showPlayClockSection - has_playclock:', sb?.has_playclock);
    return sb?.has_playclock ?? false;
  });
  readonly showQuarterSelector = computed(() => {
    const sb = this.scoreboard();
    console.log('[Facade] showQuarterSelector - is_qtr:', sb?.is_qtr);
    return sb?.is_qtr ?? false;
  });
  readonly showGameClockSection = computed(() => {
    const sb = this.scoreboard();
    console.log('[Facade] showGameClockSection - is_time:', sb?.is_time);
    return sb?.is_time ?? false;
  });

  // UI state
  readonly hideAllForms = signal(false);

  // WebSocket effects - update data in real-time

  // Handle initial-load message: sets all data at once
  private wsMatchDataEffect = effect(() => {
    const message = this.wsService.matchData();
    if (!message) return;

    const current = untracked(() => this.data());

    // Handle initial-load message: use as initial dataset if current is null and has teams
    if (!current && message['teams']) {
      this.data.set({
        ...message,
        players: message['players'] || [],
        events: message['events'] || [],
      } as unknown as ComprehensiveMatchData);
      this.loading.set(false);

      // Also update scoreboard signal if present in message
      if (message.scoreboard) {
        this.scoreboard.set(message.scoreboard as Scoreboard);
      }
      return;
    }

    // Skip if no current data yet (waiting for initial-load or HTTP load)
    if (!current) return;

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

    // Also update separate scoreboard signal (admin-specific)
    this.scoreboard.set(partial as Scoreboard);
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

  // Computed values
  readonly gameClockSeconds = computed(() => this.clockService.predictedGameClock());
  readonly playClockDisplay = signal<number | null>(null);
  private playClockClearTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private playClockHoldActive = signal<boolean>(false);
  private playClockResetSuppressed = signal<boolean>(false);

  private syncPlayClockDisplay = effect(() => {
    const pc = this.clockService.playClock();
    const status = pc?.playclock_status ?? null;
    const predicted = this.clockService.predictedPlayClock();
    const seconds = status === 'running' ? predicted : pc?.playclock ?? null;

    if (this.playClockResetSuppressed() && status !== 'running') {
      this.clearPlayClockTimeout();
      this.playClockDisplay.set(null);
      return;
    }

    if (this.playClockResetSuppressed() && status === 'running') {
      this.playClockResetSuppressed.set(false);
    }

    if (seconds == null) {
      if (this.playClockHoldActive()) {
        this.playClockDisplay.set(0);
        return;
      }
      this.clearPlayClockTimeout();
      this.playClockDisplay.set(null);
      return;
    }

    if (seconds > 0) {
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

  init(): void {
    this.connectWebSocket();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.clearPlayClockTimeout();
    this.wsService.disconnect();
  }

  navigateBack(): void {
    const matchId = this.matchId();
    const data = this.data();

    const sportId = this.sportId() ?? data?.teams?.team_a?.sport_id;
    const tournamentId = this.tournamentId() ?? data?.match?.tournament_id;

    const yearFromQuery = this.year();
    const yearFromMatchDate = (() => {
      const matchDate = data?.match?.match_date;
      if (!matchDate) return null;
      const d = new Date(matchDate);
      return Number.isFinite(d.getTime()) ? d.getFullYear() : null;
    })();
    const year = yearFromQuery ?? yearFromMatchDate ?? undefined;

    if (sportId && matchId) {
      this.navigationHelper.toMatchDetail(
        sportId,
        matchId,
        year,
        tournamentId ?? undefined
      );
    } else {
      this.navigationHelper.toSportsList();
    }
  }

  openHdView(): void {
    const id = this.matchId();
    if (id) {
      // Open HD view in new window
      window.open(`/scoreboard/match/${id}/hd`, '_blank');
    }
  }

  // Event handlers for admin forms
  // Note: We don't call loadData() after updates - WebSocket will push the changes
  onScoreChange(event: ScoreChangeEvent): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    const update = event.team === 'a'
      ? { score_team_a: event.score }
      : { score_team_b: event.score };

    this.scoreboardStore.updateMatchData(matchData.id, update).subscribe({
      error: (err) => console.error('Failed to update score', err),
    });
  }

  onQtrChange(event: QuarterChangeEvent): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    this.scoreboardStore.updateMatchData(matchData.id, {
      qtr: event.qtr,
      period_key: event.period_key,
    }).subscribe({
      error: (err) => console.error('Failed to update quarter', err),
    });
  }

  onDownDistanceChange(event: DownDistanceChangeEvent): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    this.scoreboardStore.updateMatchData(matchData.id, event).subscribe({
      error: (err) => console.error('Failed to update down/distance', err),
    });
  }

  onFlagToggle(isFlag: boolean): void {
    const sb = this.scoreboard();
    if (!sb) return;

    this.scoreboardStore.updateScoreboard(sb.id, { is_flag: isFlag }).subscribe({
      next: (updated) => this.scoreboard.set(updated),
      error: (err) => console.error('Failed to update flag', err),
    });
  }

  onGameClockAction(event: GameClockActionEvent): void {
    switch (event.action) {
      case 'start':
        this.clockService.startGameClock();
        break;
      case 'pause':
        this.clockService.pauseGameClock();
        break;
      case 'reset':
        this.clockService.resetGameClock();
        break;
      case 'update':
        if (event.data) {
          this.clockService.updateGameClock(event.data);
        }
        break;
    }
  }

  onPlayClockAction(event: PlayClockActionEvent): void {
    switch (event.action) {
      case 'start':
        if (event.seconds !== undefined) {
          this.clockService.startPlayClock(event.seconds);
        }
        break;
      case 'reset':
        this.playClockResetSuppressed.set(true);
        this.clearPlayClockTimeout();
        this.playClockDisplay.set(null);
        this.clockService.resetPlayClock();
        break;
    }
  }

  onTimeoutChange(event: TimeoutChangeEvent): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    const update = event.team === 'a'
      ? { timeout_team_a: event.timeouts }
      : { timeout_team_b: event.timeouts };

    this.scoreboardStore.updateMatchData(matchData.id, update).subscribe({
      error: (err) => console.error('Failed to update timeout', err),
    });
  }

  onScoreboardSettingsChange(update: Partial<ScoreboardUpdate>): void {
    console.log('[Facade] onScoreboardSettingsChange called with:', update);
    const sb = this.scoreboard();
    if (!sb) return;

    console.log('[Facade] Updating scoreboard id:', sb.id);
    this.scoreboardStore.updateScoreboard(sb.id, update).subscribe({
      next: (updated) => {
        console.log('[Facade] Scoreboard updated successfully:', updated);
        this.scoreboard.set(updated);
      },
      error: (err) => {
        console.error('[Facade] Failed to update scoreboard settings', err);
      },
    });
  }

  onPlayerUpdate(update: PlayerMatchUpdate): void {
    const playerId = update.id;
    const currentData = this.data();
    if (!playerId || !currentData) return;

    const payload: PlayerMatchUpdate = { ...update };
    if ('id' in payload) {
      delete payload.id;
    }
    const updatedPlayers = currentData.players.map((player) =>
      player.id === playerId ? { ...player, ...payload } : player
    );

    this.data.set({ ...currentData, players: updatedPlayers });

    this.scoreboardStore.updatePlayerMatch(playerId, payload).subscribe({
      error: (err) => {
        console.error('Failed to update player', err);
      },
    });
  }

  toggleHideAllForms(): void {
    this.hideAllForms.update((v) => !v);
    const targetState = !this.hideAllForms();

    const sectionKeys = [
      'scoreboard-score',
      'scoreboard-qtr',
      'scoreboard-time',
      'scoreboard-down-distance',
      'scoreboard-settings',
      'scoreboard-events',
    ] as const;

    sectionKeys.forEach((key) => {
      localStorage.setItem(key, String(targetState));
    });

    this.collapsibleSectionService.setGlobalExpanded(targetState);
  }

  onEventCreate(event: FootballEventCreate): void {
    const matchId = this.matchId();
    if (!matchId) return;

    const eventData = { ...event, match_id: matchId };
    this.scoreboardStore.createFootballEvent(eventData).subscribe({
      next: (createdEvent) => {
        const currentEvents = this.wsService.events();
        this.wsService.events.set([...currentEvents, createdEvent]);
      },
      error: (err) => console.error('Failed to create event', err),
    });
  }

  onEventUpdate(payload: { id: number; data: FootballEventUpdate }): void {
    this.scoreboardStore.updateFootballEvent(payload.id, payload.data).subscribe({
      next: (updatedEvent) => {
        const currentEvents = this.wsService.events();
        this.wsService.events.set(
          currentEvents.map((e) => (e.id === payload.id ? updatedEvent : e))
        );
      },
      error: (err) => console.error('Failed to update event', err),
    });
  }

  onEventDelete(eventId: number): void {
    this.scoreboardStore.deleteFootballEvent(eventId).subscribe({
      next: () => {
        const currentEvents = this.wsService.events();
        this.wsService.events.set(currentEvents.filter((e) => e.id !== eventId));
      },
      error: (err) => console.error('Failed to delete event', err),
    });
  }

  private connectWebSocket(): void {
    const id = this.matchId();
    if (id) {
      this.wsService.connect(id);
    }
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

  private clearPlayClockTimeout(): void {
    if (this.playClockClearTimeoutId != null) {
      clearTimeout(this.playClockClearTimeoutId);
      this.playClockClearTimeoutId = null;
    }
    this.playClockHoldActive.set(false);
  }
}
