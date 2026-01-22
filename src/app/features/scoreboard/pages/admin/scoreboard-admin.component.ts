import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { ScoreboardClockService } from '../../services/scoreboard-clock.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';
import { FootballEvent, FootballEventCreate, FootballEventUpdate } from '../../../matches/models/football-event.model';
import { MatchStats } from '../../../matches/models/match-stats.model';
import { Scoreboard, ScoreboardUpdate } from '../../../matches/models/scoreboard.model';
import { PlayerMatchUpdate } from '../../../matches/models/player-match.model';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { ScoreFormsComponent, ScoreChangeEvent } from '../../components/admin-forms/score-forms/score-forms.component';
import { TimeFormsComponent, GameClockActionEvent, PlayClockActionEvent } from '../../components/admin-forms/time-forms/time-forms.component';
import { QtrFormsComponent } from '../../components/admin-forms/qtr-forms/qtr-forms.component';
import { DownDistanceFormsComponent, DownDistanceChangeEvent } from '../../components/admin-forms/down-distance-forms/down-distance-forms.component';
import { TimeoutFormsComponent, TimeoutChangeEvent } from '../../components/admin-forms/timeout-forms/timeout-forms.component';
import { ScoreboardSettingsFormsComponent } from '../../components/admin-forms/scoreboard-settings-forms/scoreboard-settings-forms.component';
import { EventsFormsComponent } from '../../components/admin-forms/events-forms/events-forms.component';
import { ConnectionIndicatorComponent } from '../../../../shared/components/connection-indicator/connection-indicator.component';

@Component({
  selector: 'app-scoreboard-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiButton,
    TuiIcon,
    ScoreboardDisplayComponent,
    ScoreFormsComponent,
    TimeFormsComponent,
    QtrFormsComponent,
    DownDistanceFormsComponent,
    TimeoutFormsComponent,
    ScoreboardSettingsFormsComponent,
    EventsFormsComponent,
    ConnectionIndicatorComponent,
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

  matchId = createNumberParamSignal(this.route, 'matchId');

  // Data signals
  protected readonly data = signal<ComprehensiveMatchData | null>(null);
  protected readonly scoreboard = signal<Scoreboard | null>(null);
  protected readonly matchStats = signal<MatchStats | null>(null);
  protected readonly events = signal<FootballEvent[]>([]);
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
  private wsMatchDataEffect = effect(() => {
    const message = this.wsService.matchData();
    if (!message) return;

    const current = untracked(() => this.data());
    if (!current) return;

    // Update data from WebSocket message
    this.data.set({
      ...current,
      match_data: message.match_data ?? current.match_data,
      scoreboard: (message.scoreboard as ComprehensiveMatchData['scoreboard']) ?? current.scoreboard,
    });

    // Also update scoreboard signal if present in message
    if (message.scoreboard) {
      this.scoreboard.set(message.scoreboard as Scoreboard);
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
    this.loadData();
    this.connectWebSocket();
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

    this.clockService.load(id);

    // Load scoreboard settings
    this.scoreboardStore.getScoreboard(id).subscribe({
      next: (sb) => this.scoreboard.set(sb),
      error: () => console.error('Failed to load scoreboard settings'),
    });

    // Load match stats
    this.scoreboardStore.getMatchStats(id).subscribe({
      next: (stats) => this.matchStats.set(stats),
      error: () => console.error('Failed to load match stats'),
    });

    // Load events
    this.scoreboardStore.getMatchEvents(id).subscribe({
      next: (evts) => this.events.set(evts),
      error: () => console.error('Failed to load events'),
    });
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

  onQtrChange(qtr: string): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    this.scoreboardStore.updateMatchData(matchData.id, { qtr }).subscribe({
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
        this.loadData();
      },
    });
  }

  toggleHideAllForms(): void {
    this.hideAllForms.update((v) => !v);
  }

  onEventCreate(event: FootballEventCreate): void {
    const matchId = this.matchId();
    if (!matchId) return;

    const eventData = { ...event, match_id: matchId };
    this.scoreboardStore.createFootballEvent(eventData).subscribe({
      next: () => this.reloadEvents(),
      error: (err) => console.error('Failed to create event', err),
    });
  }

  onEventUpdate(payload: { id: number; data: FootballEventUpdate }): void {
    this.scoreboardStore.updateFootballEvent(payload.id, payload.data).subscribe({
      next: () => this.reloadEvents(),
      error: (err) => console.error('Failed to update event', err),
    });
  }

  onEventDelete(eventId: number): void {
    this.scoreboardStore.deleteFootballEvent(eventId).subscribe({
      next: () => this.reloadEvents(),
      error: (err) => console.error('Failed to delete event', err),
    });
  }

  private reloadEvents(): void {
    const id = this.matchId();
    if (!id) return;

    this.scoreboardStore.getMatchEvents(id).subscribe({
      next: (evts) => this.events.set(evts),
      error: () => console.error('Failed to reload events'),
    });

    // Also reload stats since they depend on events
    this.scoreboardStore.getMatchStats(id).subscribe({
      next: (stats) => this.matchStats.set(stats),
      error: () => console.error('Failed to reload match stats'),
    });
  }
}
