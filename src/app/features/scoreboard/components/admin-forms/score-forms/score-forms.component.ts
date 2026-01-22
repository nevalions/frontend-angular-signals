import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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

  // Current scores computed from match data
  protected readonly scoreTeamA = computed(() => this.matchData()?.score_team_a ?? 0);
  protected readonly scoreTeamB = computed(() => this.matchData()?.score_team_b ?? 0);

  // Quick score button configurations
  protected readonly quickScoreButtons = [
    { label: '+6', value: 6, title: 'Touchdown' },
    { label: '+3', value: 3, title: 'Field Goal' },
    { label: '+2', value: 2, title: '2-Point Conversion / Safety' },
    { label: '+1', value: 1, title: 'Extra Point' },
    { label: '-1', value: -1, title: 'Remove 1 Point' },
  ];

  /**
   * Handle score input change for team A
   */
  onScoreAChange(newScore: number): void {
    this.scoreChange.emit({ team: 'a', score: newScore });
  }

  /**
   * Handle score input change for team B
   */
  onScoreBChange(newScore: number): void {
    this.scoreChange.emit({ team: 'b', score: newScore });
  }

  /**
   * Handle quick score button click
   */
  onQuickScore(team: 'a' | 'b', points: number): void {
    const currentScore = team === 'a' ? this.scoreTeamA() : this.scoreTeamB();
    const newScore = Math.max(0, currentScore + points);
    this.scoreChange.emit({ team, score: newScore });
  }
}
