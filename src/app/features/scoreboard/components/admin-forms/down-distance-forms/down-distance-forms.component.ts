import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { MatchData } from '../../../../matches/models/match-data.model';
import { Scoreboard } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { InputNumberWithButtonsComponent } from '../input-number-with-buttons/input-number-with-buttons.component';

export interface DownDistanceChangeEvent {
  down?: string;
  distance?: string;
  ball_on?: number;
}

export interface DownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-down-distance-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiIcon, CollapsibleSectionComponent, InputNumberWithButtonsComponent],
  templateUrl: './down-distance-forms.component.html',
  styleUrl: './down-distance-forms.component.less',
})
export class DownDistanceFormsComponent {
  /** Match data containing current down/distance */
  matchData = input<MatchData | null>(null);

  /** Scoreboard settings for flag toggle */
  scoreboard = input<Scoreboard | null>(null);

  /** Emits when down/distance changes */
  downDistanceChange = output<DownDistanceChangeEvent>();

  /** Emits when flag toggle changes */
  flagToggle = output<boolean>();

  /** Available down options */
  protected readonly downOptions: DownOption[] = [
    { value: '1st', label: '1st' },
    { value: '2nd', label: '2nd' },
    { value: '3rd', label: '3rd' },
    { value: '4th', label: '4th' },
  ];

  /** Common distance presets */
  protected readonly distancePresets = [
    { value: '10', label: '10' },
    { value: 'Goal', label: 'Goal' },
    { value: 'Inches', label: 'Inches' },
  ];

  // Computed values from match data
  protected readonly currentDown = computed(() => this.matchData()?.down ?? '1st');
  protected readonly currentDistance = computed(() => {
    const dist = this.matchData()?.distance;
    return dist ? parseInt(dist, 10) || 10 : 10;
  });
  protected readonly currentDistanceText = computed(() => this.matchData()?.distance ?? '10');
  protected readonly currentBallOn = computed(() => this.matchData()?.ball_on ?? 50);
  protected readonly isFlagActive = computed(() => this.scoreboard()?.is_flag ?? false);

  /**
   * Handle down selection
   */
  onDownSelect(down: string): void {
    this.downDistanceChange.emit({ down });
  }

  /**
   * Handle distance change from input
   */
  onDistanceChange(distance: number): void {
    this.downDistanceChange.emit({ distance: distance.toString() });
  }

  /**
   * Handle distance preset selection
   */
  onDistancePreset(value: string): void {
    this.downDistanceChange.emit({ distance: value });
  }

  /**
   * Handle ball on change
   */
  onBallOnChange(ballOn: number): void {
    this.downDistanceChange.emit({ ball_on: ballOn });
  }

  /**
   * Toggle flag indicator
   */
  onFlagToggle(): void {
    this.flagToggle.emit(!this.isFlagActive());
  }

  /**
   * Check if a down option is currently selected
   */
  isDownSelected(down: string): boolean {
    return this.currentDown() === down;
  }

  /**
   * Check if a distance preset is currently selected
   */
  isDistancePresetSelected(value: string): boolean {
    return this.currentDistanceText() === value;
  }
}
