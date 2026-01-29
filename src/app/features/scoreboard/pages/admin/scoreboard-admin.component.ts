import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { ScoreboardClockService } from '../../services/scoreboard-clock.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';
import { FootballEventCreate, FootballEventUpdate } from '../../../matches/models/football-event.model';
import { Scoreboard, ScoreboardUpdate } from '../../../matches/models/scoreboard.model';
import { PlayerMatchUpdate } from '../../../matches/models/player-match.model';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { ScoreFormsComponent, ScoreChangeEvent, TimeoutChangeEvent, QuarterChangeEvent } from '../../components/admin-forms/score-forms/score-forms.component';
import { TimeFormsComponent, GameClockActionEvent, PlayClockActionEvent } from '../../components/admin-forms/time-forms/time-forms.component';
import { DownDistanceFormsComponent, DownDistanceChangeEvent } from '../../components/admin-forms/down-distance-forms/down-distance-forms.component';
import { ScoreboardSettingsFormsComponent } from '../../components/admin-forms/scoreboard-settings-forms/scoreboard-settings-forms.component';
import { EventsFormsComponent } from '../../components/admin-forms/events-forms/events-forms.component';
import { ConnectionIndicatorComponent } from '../../../../shared/components/connection-indicator/connection-indicator.component';
import { CollapsibleSectionService } from '../../components/admin-forms/collapsible-section/collapsible-section.service';
import { PlayByPlayComponent } from '../../components/play-by-play/play-by-play.component';

@Component({
  selector: 'app-scoreboard-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiButton,
    TuiIcon,
    ScoreboardDisplayComponent,
    ScoreFormsComponent,
    TimeFormsComponent,
    DownDistanceFormsComponent,
    ScoreboardSettingsFormsComponent,
    EventsFormsComponent,
    ConnectionIndicatorComponent,
    PlayByPlayComponent,
  ],
  templateUrl: './scoreboard-admin.component.html',
  styleUrl: './scoreboard-admin.component.less',
})
export class ScoreboardAdminComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scoreboardStore = inject(ScoreboardStoreService);
  private clockService = inject(ScoreboardClockService);
  private wsService = inject(WebSocketService);
  private readonly collapsibleSectionService = inject(CollapsibleSectionService);

  matchId = createNumberParamSignal(this.route, 'matchId');

  // Data signals
  protected readonly data = signal<ComprehensiveMatchData | null>(null);
  protected readonly scoreboard = signal<Scoreboard | null>(null);
  protected readonly matchStats = computed(() => this.wsService.statistics());
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly gameClock = computed(() => this.clockService.gameClock());
  protected readonly playClock = computed(() => this.clockService.playClock());
  protected readonly gameClockLocked = computed(() => this.clockService.gameClockActionLocked());
  protected readonly playClockLocked = computed(() => this.clockService.playClockActionLocked());

  protected readonly gameClockWithPredictedValue = computed(() => {
    const gc = this.clockService.gameClock();
    const predicted = this.clockService.predictedGameClock();
    if (!gc) return null;
    return { ...gc, gameclock: predicted };
  });

  protected readonly playClockWithPredictedValue = computed(() => {
    const pc = this.clockService.playClock();
    const predicted = this.clockService.predictedPlayClock();
    if (!pc) return null;
    return { ...pc, playclock: predicted };
  });

  // UI state
  protected readonly hideAllForms = signal(false);

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
  protected readonly matchTitle = computed(() => {
    const d = this.data();
    if (!d?.teams) return 'Loading...';
    return `${d.teams.team_a?.title || 'Team A'} vs ${d.teams.team_b?.title || 'Team B'}`;
  });

  protected readonly gameClockSeconds = computed(() => this.clockService.predictedGameClock());
  protected readonly playClockSeconds = computed(() => this.clockService.predictedPlayClock());

  ngOnInit(): void {
    this.connectWebSocket();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
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

  navigateBack(): void {
    // Navigate back to match detail
    // For now, use history back since we don't have full context
    window.history.back();
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

    this.scoreboardStore.updateMatchData(matchData.id, { qtr: event.qtr }).subscribe({
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
    const sb = this.scoreboard();
    if (!sb) return;

    this.scoreboardStore.updateScoreboard(sb.id, update).subscribe({
      next: (updated) => this.scoreboard.set(updated),
      error: (err) => console.error('Failed to update scoreboard settings', err),
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
}
