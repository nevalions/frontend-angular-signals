import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';
import { GameClock } from '../../../matches/models/gameclock.model';
import { PlayClock } from '../../../matches/models/playclock.model';
import { Scoreboard, ScoreboardUpdate } from '../../../matches/models/scoreboard.model';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { ScoreFormsComponent, ScoreChangeEvent } from '../../components/admin-forms/score-forms/score-forms.component';
import { TimeFormsComponent, GameClockActionEvent, PlayClockActionEvent } from '../../components/admin-forms/time-forms/time-forms.component';
import { QtrFormsComponent } from '../../components/admin-forms/qtr-forms/qtr-forms.component';
import { DownDistanceFormsComponent, DownDistanceChangeEvent } from '../../components/admin-forms/down-distance-forms/down-distance-forms.component';
import { TimeoutFormsComponent, TimeoutChangeEvent } from '../../components/admin-forms/timeout-forms/timeout-forms.component';
import { ScoreboardSettingsFormsComponent } from '../../components/admin-forms/scoreboard-settings-forms/scoreboard-settings-forms.component';

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
  ],
  templateUrl: './scoreboard-admin.component.html',
  styleUrl: './scoreboard-admin.component.less',
})
export class ScoreboardAdminComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scoreboardStore = inject(ScoreboardStoreService);

  matchId = createNumberParamSignal(this.route, 'matchId');

  // Data signals
  protected readonly data = signal<ComprehensiveMatchData | null>(null);
  protected readonly gameClock = signal<GameClock | null>(null);
  protected readonly playClock = signal<PlayClock | null>(null);
  protected readonly scoreboard = signal<Scoreboard | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // UI state
  protected readonly hideAllForms = signal(false);

  // Computed values
  protected readonly matchTitle = computed(() => {
    const d = this.data();
    if (!d?.teams) return 'Loading...';
    return `${d.teams.team_a?.title || 'Team A'} vs ${d.teams.team_b?.title || 'Team B'}`;
  });

  protected readonly gameClockSeconds = computed(() => this.gameClock()?.gameclock ?? 0);
  protected readonly playClockSeconds = computed(() => this.playClock()?.playclock ?? null);

  ngOnInit(): void {
    this.loadData();
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

    // Load scoreboard settings
    this.scoreboardStore.getScoreboard(id).subscribe({
      next: (sb) => this.scoreboard.set(sb),
      error: () => console.error('Failed to load scoreboard settings'),
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
  onScoreChange(event: ScoreChangeEvent): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    const update = event.team === 'a'
      ? { score_team_a: event.score }
      : { score_team_b: event.score };

    this.scoreboardStore.updateMatchData(matchData.id, update).subscribe({
      next: () => this.loadData(), // Reload to get updated data
      error: (err) => console.error('Failed to update score', err),
    });
  }

  onQtrChange(qtr: string): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    this.scoreboardStore.updateMatchData(matchData.id, { qtr }).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Failed to update quarter', err),
    });
  }

  onDownDistanceChange(event: DownDistanceChangeEvent): void {
    const matchData = this.data()?.match_data;
    if (!matchData) return;

    this.scoreboardStore.updateMatchData(matchData.id, event).subscribe({
      next: () => this.loadData(),
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
    const gc = this.gameClock();
    if (!gc) return;

    switch (event.action) {
      case 'start':
        this.scoreboardStore.startGameClock(gc.id).subscribe({
          next: (updated) => this.gameClock.set(updated),
        });
        break;
      case 'pause':
        this.scoreboardStore.pauseGameClock(gc.id).subscribe({
          next: (updated) => this.gameClock.set(updated),
        });
        break;
      case 'reset':
        this.scoreboardStore.resetGameClock(gc.id).subscribe({
          next: (updated) => this.gameClock.set(updated),
        });
        break;
      case 'update':
        if (event.data) {
          this.scoreboardStore.updateGameClock(gc.id, event.data).subscribe({
            next: (updated) => this.gameClock.set(updated),
          });
        }
        break;
    }
  }

  onPlayClockAction(event: PlayClockActionEvent): void {
    const pc = this.playClock();
    if (!pc) return;

    switch (event.action) {
      case 'start':
        if (event.seconds !== undefined) {
          this.scoreboardStore.startPlayClock(pc.id, event.seconds).subscribe({
            next: (updated) => this.playClock.set(updated),
          });
        }
        break;
      case 'reset':
        this.scoreboardStore.resetPlayClock(pc.id).subscribe({
          next: (updated) => this.playClock.set(updated),
        });
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
      next: () => this.loadData(),
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

  toggleHideAllForms(): void {
    this.hideAllForms.update((v) => !v);
  }
}
