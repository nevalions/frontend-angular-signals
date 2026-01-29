import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { MatchData } from '../../../../matches/models/match-data.model';
import { Scoreboard } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

export interface DownDistanceChangeEvent {
  down?: string;
  distance?: string;
}

export interface DownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-down-distance-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TuiButton, TuiTextfield, TuiSelect, TuiChevron, TuiDataListWrapper, CollapsibleSectionComponent],
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

  /** Distance options (1-20 and 20+) */
  protected readonly distanceOptions = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '20+',
  ] as const;

  // Local state for pending down and distance
  protected readonly pendingDown = signal<string>('1st');
  protected readonly pendingDistance = signal<string>('10');

  // Computed values from match data (displayed as "Current")
  protected readonly currentDown = computed(() => this.matchData()?.down ?? '1st');
  protected readonly currentDistance = computed(() => this.matchData()?.distance ?? '10');
  protected readonly isFlagActive = computed(() => this.scoreboard()?.is_flag ?? false);

  // Check if there are unsaved changes
  protected readonly hasChanges = computed(() => {
    const data = this.matchData();
    if (!data) return false;
    return (
      this.pendingDown() !== (data.down ?? '1st') ||
      this.pendingDistance() !== (data.distance ?? '10')
    );
  });

  /**
   * Handle down selection - updates local state only
   */
  onDownSelect(down: string): void {
    this.pendingDown.set(down);
  }

  /**
   * Save the pending down and distance changes
   */
  onSave(): void {
    const currentDown = this.matchData()?.down ?? '1st';
    const currentDistance = this.matchData()?.distance ?? '10';

    // Only emit if values actually changed
    if (this.pendingDown() !== currentDown || this.pendingDistance() !== currentDistance) {
      this.downDistanceChange.emit({
        down: this.pendingDown(),
        distance: this.pendingDistance(),
      });
    }
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
    return this.pendingDown() === down;
  }

  constructor() {
    // Sync local state when match data changes
    effect(() => {
      const data = this.matchData();
      if (data) {
        this.pendingDown.set(data.down ?? '1st');
        this.pendingDistance.set(data.distance ?? '10');
      }
    });
  }


}
