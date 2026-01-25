import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { MatchData } from '../../../../matches/models/match-data.model';
import { InputNumberWithButtonsComponent } from '../input-number-with-buttons/input-number-with-buttons.component';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

export interface ScoreChangeEvent {
  team: 'a' | 'b';
  score: number;
}

@Component({
  selector: 'app-score-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, InputNumberWithButtonsComponent, CollapsibleSectionComponent],
  templateUrl: './score-forms.component.html',
  styleUrl: './score-forms.component.less',
})
export class ScoreFormsComponent {
  /** Match data containing current scores */
  matchData = input<MatchData | null>(null);

  /** Emits when score changes */
  scoreChange = output<ScoreChangeEvent>();

  // Local state for pending scores
  protected readonly pendingScoreTeamA = signal(0);
  protected readonly pendingScoreTeamB = signal(0);

  // Toggle state for touchdown called
  protected readonly touchdownCalledTeamA = signal(false);
  protected readonly touchdownCalledTeamB = signal(false);

  // Check if there are unsaved changes
  protected readonly hasChanges = computed(() => {
    const data = this.matchData();
    if (!data) return false;
    return (
      this.pendingScoreTeamA() !== (data.score_team_a ?? 0) ||
      this.pendingScoreTeamB() !== (data.score_team_b ?? 0)
    );
  });

  // Quick score button configurations
  protected readonly quickScoreButtons = [
    { label: '+6', value: 6, title: 'Touchdown' },
    { label: '+3', value: 3, title: 'Field Goal' },
    { label: '+2', value: 2, title: '2-Point Conversion / Safety' },
    { label: '+1', value: 1, title: 'Extra Point' },
    { label: '-1', value: -1, title: 'Remove 1 Point' },
  ];

  constructor() {
    // Sync local state when match data changes
    effect(() => {
      const data = this.matchData();
      if (data) {
        this.pendingScoreTeamA.set(data.score_team_a ?? 0);
        this.pendingScoreTeamB.set(data.score_team_b ?? 0);
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
   * Toggle touchdown called for a team
   */
  toggleTouchdownCalled(team: 'a' | 'b'): void {
    if (team === 'a') {
      this.touchdownCalledTeamA.update(value => !value);
    } else {
      this.touchdownCalledTeamB.update(value => !value);
    }
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
}
