import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { MatchData } from '../../../../matches/models/match-data.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

export interface TimeoutChangeEvent {
  team: 'a' | 'b';
  timeouts: string;
}

@Component({
  selector: 'app-timeout-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiIcon, CollapsibleSectionComponent],
  templateUrl: './timeout-forms.component.html',
  styleUrl: './timeout-forms.component.less',
})
export class TimeoutFormsComponent {
  /** Match data containing timeout info */
  matchData = input<MatchData | null>(null);

  /** Emits when timeout changes */
  timeoutChange = output<TimeoutChangeEvent>();

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

  private countTimeouts(timeoutStr: string): number {
    if (!timeoutStr) return 3; // Default full timeouts
    // Count 'o' characters as remaining timeouts
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
