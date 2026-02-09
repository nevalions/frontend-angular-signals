import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type TuiStringHandler } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiBadgeNotification, TuiBadgedContent, TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { MatchData } from '../../../../matches/models/match-data.model';
import { Scoreboard } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { ScoreboardTranslationService } from '../../../services/scoreboard-translation.service';

export interface DownDistanceChangeEvent {
  down?: string;
  distance?: string;
}

export interface DownOption {
  value: string;
  label: string;
}

export interface DistanceOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-down-distance-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiButton,
    TuiTextfield,
    TuiSelect,
    TuiChevron,
    TuiDataList,
    TuiBadgedContent,
    TuiBadgeNotification,
    CollapsibleSectionComponent,
  ],
  providers: [ScoreboardTranslationService],
  templateUrl: './down-distance-forms.component.html',
  styleUrl: './down-distance-forms.component.less',
})
export class DownDistanceFormsComponent {
  private readonly translations = inject(ScoreboardTranslationService);

  /** Match data containing current down/distance */
  matchData = input<MatchData | null>(null);

  /** Scoreboard settings for flag toggle */
  scoreboard = input<Scoreboard | null>(null);

  /** Emits when down/distance changes */
  downDistanceChange = output<DownDistanceChangeEvent>();

  /** Emits when flag toggle changes */
  flagToggle = output<boolean>();

  private readonly downValues = ['1st', '2nd', '3rd', '4th'] as const;

  private readonly distanceValues = [
    'INCH',
    'GOAL',
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

  private readonly specialStates = ['PAT 1', 'PAT 2', 'FG', 'KICK OFF'] as const;

  /** Available down options */
  protected readonly downOptions = computed<DownOption[]>(() => {
    return this.downValues.map((value) => ({
      value,
      label: this.translations.getDownLabel(value),
    }));
  });

  /** Distance options (INCH, GOAL, 1-20, 20+) */
  protected readonly distanceOptions = computed<DistanceOption[]>(() => {
    return this.distanceValues.map((value) => ({
      value,
      label: this.translations.getDistanceLabel(value),
    }));
  });

  protected readonly specialStateOptions = computed<DistanceOption[]>(() => {
    return this.specialStates.map((value) => ({
      value,
      label: this.translations.getDistanceLabel(value),
    }));
  });

  protected readonly distanceStringify: TuiStringHandler<string> = (value) => {
    return this.translations.getDistanceLabel(value);
  };

  // Local state for pending down and distance
  protected readonly pendingDown = signal<string>('1st');
  protected readonly pendingDistance = signal<string>('10');

  // Computed values for display (based on pending values)
  protected readonly currentDown = computed(() => this.pendingDown());
  protected readonly currentDistance = computed(() => this.pendingDistance());
  protected readonly currentDownDistance = computed(() => {
    return this.translations.formatDownDistance(this.pendingDown(), this.pendingDistance());
  });

  protected readonly quickPresetInchLabel = computed(() => this.translations.getDistanceLabel('INCH'));
  protected readonly quickPresetGoalLabel = computed(() => this.translations.getDistanceLabel('GOAL'));
  protected readonly quickPresetOneTenLabel = computed(() => this.translations.formatDownDistance('1st', '10'));
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

  /**
   * Handle special game state selection
   */
  onSpecialStateSelect(state: string): void {
    this.pendingDown.set('');
    this.pendingDistance.set(state);
  }

  /**
   * Check if a special state is currently selected
   */
  isSpecialStateSelected(state: string): boolean {
    return this.pendingDown() === '' && this.pendingDistance() === state;
  }

  constructor() {
    effect(() => {
      this.translations.setLanguage(this.scoreboard()?.language_code ?? 'en');
    });

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
