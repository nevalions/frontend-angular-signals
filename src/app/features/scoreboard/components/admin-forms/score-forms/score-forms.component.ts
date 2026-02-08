import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiInputNumber, TuiSelect } from '@taiga-ui/kit';
import { MatchData } from '../../../../matches/models/match-data.model';
import { Scoreboard, ScoreboardUpdate } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

export interface ScoreChangeEvent {
  team: 'a' | 'b';
  score: number;
}

export interface TimeoutChangeEvent {
  team: 'a' | 'b';
  timeouts: string;
}

export interface QuarterChangeEvent {
  qtr: string;
}

@Component({
  selector: 'app-score-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TuiButton, TuiTextfield, TuiInputNumber, TuiIcon, TuiSelect, TuiChevron, TuiDataListWrapper, CollapsibleSectionComponent],
  templateUrl: './score-forms.component.html',
  styleUrl: './score-forms.component.less',
})
export class ScoreFormsComponent {
  /** Match data containing current scores */
  matchData = input<MatchData | null>(null);

  /** Scoreboard settings (touchdown/timeout indicators) */
  scoreboard = input<Scoreboard | null>(null);

  /** Team A color */
  teamColorA = input<string>('#ffffff');

  /** Team B color */
  teamColorB = input<string>('#ffffff');

  /** Emits when score changes */
  scoreChange = output<ScoreChangeEvent>();

  /** Emits when timeout changes */
  timeoutChange = output<TimeoutChangeEvent>();

  /** Emits when quarter changes */
  qtrChange = output<QuarterChangeEvent>();

  /** Emits when scoreboard indicator changes (touchdown/timeout called) */
  scoreboardIndicatorChange = output<Partial<ScoreboardUpdate>>();

  /** Available quarter options */
  protected readonly quarterOptions = [
    '1st',
    '2nd',
    '3rd',
    '4th',
    'OT',
  ] as const;

  /** Selected quarter (local state) */
  protected readonly selectedQtr = signal<string>('1st');

  // Local state for pending scores
  protected readonly pendingScoreTeamA = signal(0);
  protected readonly pendingScoreTeamB = signal(0);

  // Scoreboard-driven toggle state (single source of truth)
  protected readonly touchdownCalledTeamA = computed(() => this.scoreboard()?.is_goal_team_a ?? false);
  protected readonly touchdownCalledTeamB = computed(() => this.scoreboard()?.is_goal_team_b ?? false);
  protected readonly timeoutCalledTeamA = computed(() => this.scoreboard()?.is_timeout_team_a ?? false);
  protected readonly timeoutCalledTeamB = computed(() => this.scoreboard()?.is_timeout_team_b ?? false);

  // Manual edit section expanded state
  protected readonly manualEditExpanded = signal(false);

  // Check if there are unsaved changes
  protected readonly hasChanges = computed(() => {
    const data = this.matchData();
    if (!data) return false;
    return (
      this.pendingScoreTeamA() !== (data.score_team_a ?? 0) ||
      this.pendingScoreTeamB() !== (data.score_team_b ?? 0)
    );
  });

  // Parse timeout strings into count (assumes format like "ooo" or "oo" or "o")
  protected readonly timeoutsTeamA = computed(() => {
    const timeout = this.matchData()?.timeout_team_a || '';
    return this.countTimeouts(timeout);
  });

  protected readonly timeoutsTeamB = computed(() => {
    const timeout = this.matchData()?.timeout_team_b || '';
    return this.countTimeouts(timeout);
  });

  // Create timeout indicator arrays (3 max timeouts)
  protected readonly indicatorsTeamA = computed(() => {
    return this.createIndicators(this.timeoutsTeamA());
  });

  protected readonly indicatorsTeamB = computed(() => {
    return this.createIndicators(this.timeoutsTeamB());
  });

  // Quick score button configurations
  protected readonly quickScoreButtons = [
    { label: '+6', value: 6, title: 'Touchdown' },
    { label: '+3', value: 3, title: 'Field Goal' },
    { label: '+2', value: 2, title: '2-Point Conversion / Safety' },
    { label: '+1', value: 1, title: 'Extra Point' },
    { label: '-1', value: -1, title: 'Remove 1 Point' },
  ];

  // Team score input configurations
  protected readonly teamConfig = [
    {
      key: 'a' as const,
      label: 'Home Team',
      class: 'team-a',
      pendingScore: this.pendingScoreTeamA,
      onChange: (score: number) => this.onScoreAChange(score),
      touchdownCalled: this.touchdownCalledTeamA,
      toggleTouchdown: () => this.onTouchdownIndicatorToggle('a'),
      timeoutCalled: this.timeoutCalledTeamA,
      toggleTimeout: () => this.onTimeoutIndicatorToggle('a'),
      onQuickScore: (points: number) => this.onQuickScore('a', points),
    },
    {
      key: 'b' as const,
      label: 'Away Team',
      class: 'team-b',
      pendingScore: this.pendingScoreTeamB,
      onChange: (score: number) => this.onScoreBChange(score),
      touchdownCalled: this.touchdownCalledTeamB,
      toggleTouchdown: () => this.onTouchdownIndicatorToggle('b'),
      timeoutCalled: this.timeoutCalledTeamB,
      toggleTimeout: () => this.onTimeoutIndicatorToggle('b'),
      onQuickScore: (points: number) => this.onQuickScore('b', points),
    },
  ];

  private countTimeouts(timeoutStr: string): number {
    if (!timeoutStr) return 3;
    return (timeoutStr.match(/o/gi) || []).length;
  }

  private createIndicators(remaining: number): boolean[] {
    const indicators: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      indicators.push(i < remaining);
    }
    return indicators;
  }

  private createTimeoutString(remaining: number): string {
    return 'o'.repeat(remaining) + '●'.repeat(3 - remaining);
  }

  constructor() {
    // Sync local state when match data changes
    effect(() => {
      const data = this.matchData();
      if (data) {
        this.pendingScoreTeamA.set(data.score_team_a ?? 0);
        this.pendingScoreTeamB.set(data.score_team_b ?? 0);
        this.selectedQtr.set(data.qtr ?? '1st');
      }
    });

    // Emit quarter changes
    effect(() => {
      const qtr = this.selectedQtr();
      const data = this.matchData();
      if (data && qtr !== data.qtr) {
        this.qtrChange.emit({ qtr });
      }
    });
  }

  /**
   * Handle score input change for team A
   */
  onScoreAChange(newScore: number): void {
    this.pendingScoreTeamA.set(newScore);
  }

  /**
   * Handle score input change for team B
   */
  onScoreBChange(newScore: number): void {
    this.pendingScoreTeamB.set(newScore);
  }

  /**
   * Handle quick score button click - applies immediately without save
   */
  onQuickScore(team: 'a' | 'b', points: number): void {
    const currentScore = team === 'a' ? this.pendingScoreTeamA() : this.pendingScoreTeamB();
    const newScore = Math.max(0, currentScore + points);
    
    if (team === 'a') {
      this.pendingScoreTeamA.set(newScore);
    } else {
      this.pendingScoreTeamB.set(newScore);
    }

    // Apply immediately without waiting for save
    this.scoreChange.emit({ team, score: newScore });
  }

  /**
   * Toggle touchdown called for a team (shows TOUCHDOWN instead of team title)
   * Stored in Scoreboard as is_goal_team_a / is_goal_team_b.
   */
  onTouchdownIndicatorToggle(team: 'a' | 'b'): void {
    const sb = this.scoreboard();

    const current = team === 'a'
      ? (sb?.is_goal_team_a ?? false)
      : (sb?.is_goal_team_b ?? false);

    const next = !current;

    const update: Partial<ScoreboardUpdate> = team === 'a'
      ? {
        is_goal_team_a: next,
        ...(next ? { is_timeout_team_a: false } : {}),
      }
      : {
        is_goal_team_b: next,
        ...(next ? { is_timeout_team_b: false } : {}),
      };

    this.scoreboardIndicatorChange.emit(update);
  }

  /**
   * Toggle timeout called for a team (shows TIMEOUT instead of team title)
   * Stored in Scoreboard as is_timeout_team_a / is_timeout_team_b.
   */
  onTimeoutIndicatorToggle(team: 'a' | 'b'): void {
    const sb = this.scoreboard();

    const current = team === 'a'
      ? (sb?.is_timeout_team_a ?? false)
      : (sb?.is_timeout_team_b ?? false);

    const next = !current;

    const update: Partial<ScoreboardUpdate> = team === 'a'
      ? {
        is_timeout_team_a: next,
        ...(next ? { is_goal_team_a: false } : {}),
      }
      : {
        is_timeout_team_b: next,
        ...(next ? { is_goal_team_b: false } : {}),
      };

    this.scoreboardIndicatorChange.emit(update);
  }

   /**
      * Save the pending scores
      */
   onSave(): void {
     const currentScoreA = this.matchData()?.score_team_a ?? 0;
     const currentScoreB = this.matchData()?.score_team_b ?? 0;

     // Only emit if values actually changed
     if (this.pendingScoreTeamA() !== currentScoreA) {
       this.scoreChange.emit({ team: 'a', score: this.pendingScoreTeamA() });
     }
     if (this.pendingScoreTeamB() !== currentScoreB) {
       this.scoreChange.emit({ team: 'b', score: this.pendingScoreTeamB() });
     }
   }

  /**
   * Add timeout for a team (decrease remaining)
   */
  onUseTimeout(team: 'a' | 'b'): void {
    const current = team === 'a' ? this.timeoutsTeamA() : this.timeoutsTeamB();
    if (current > 0) {
      this.timeoutChange.emit({
        team,
        timeouts: this.createTimeoutString(current - 1),
      });
    }
  }

  /**
   * Restore timeout for a team (increase remaining)
   */
  onRestoreTimeout(team: 'a' | 'b'): void {
    const current = team === 'a' ? this.timeoutsTeamA() : this.timeoutsTeamB();
    if (current < 3) {
      this.timeoutChange.emit({
        team,
        timeouts: this.createTimeoutString(current + 1),
      });
    }
  }

  /**
     * Reset all timeouts for a team
     */
  onResetTimeouts(team: 'a' | 'b'): void {
    this.timeoutChange.emit({
      team,
      timeouts: 'ooo',
    });
  }

 }
