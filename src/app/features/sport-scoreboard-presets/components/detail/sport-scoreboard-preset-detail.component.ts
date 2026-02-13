import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { of } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiDialogService, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { SportScoreboardPreset } from '../../models/sport-scoreboard-preset.model';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { DEFAULT_QUICK_SCORE_DELTAS } from '../../utils/period-labels-form.util';

@Component({
  selector: 'app-sport-scoreboard-preset-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent, RouterLink, UpperCasePipe, TuiBadge, TuiCardLarge, TuiCell, TuiLoader],
  templateUrl: './sport-scoreboard-preset-detail.component.html',
  styleUrl: './sport-scoreboard-preset-detail.component.less',
})
export class SportScoreboardPresetDetailComponent {
  private route = inject(ActivatedRoute);
  private presetStore = inject(SportScoreboardPresetStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  presetId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  preset = computed(() => {
    const id = this.presetId();
    if (!id) return null;
    return this.presetStore.presets().find((p: SportScoreboardPreset) => p.id === id) || null;
  });

  loading = this.presetStore.loading;

  sportsResource = rxResource({
    params: computed(() => ({
      presetId: this.presetId(),
    })),
    stream: ({ params }) => {
      if (!params.presetId) {
        return of([]);
      }
      return this.presetStore.getSportsByPreset(params.presetId);
    },
  });

  sports = computed(() => {
    const value = this.sportsResource.value();
    if (!value || !Array.isArray(value)) return [];
    return value as Array<{ id: number; title: string }>;
  });
  sportsLoading = computed(() => this.sportsResource.isLoading());

  readonly directionLabel = computed(() => this.toTitle(this.preset()?.direction));

  readonly onStopBehaviorLabel = computed(() => this.toTitle(this.preset()?.on_stop_behavior));

  readonly initialTimeModeLabel = computed(() => {
    const mode = this.preset()?.initial_time_mode;
    if (!mode) return 'N/A';

    const labels: Record<string, string> = {
      max: 'Max Time',
      zero: 'Zero',
      min: 'Custom Min',
    };

    return labels[mode] ?? mode;
  });

  readonly periodClockVariantLabel = computed(() => {
    const variant = this.preset()?.period_clock_variant ?? 'per_period';
    const labels: Record<string, string> = {
      per_period: 'Per Period Reset',
      cumulative: 'Cumulative Across Periods',
    };

    return labels[variant] ?? variant;
  });

  readonly periodModeLabel = computed(() => {
    const mode = this.preset()?.period_mode;
    if (!mode) return 'N/A';

    const labels: Record<string, string> = {
      qtr: 'Quarter',
      period: 'Period',
      half: 'Half',
      set: 'Set',
      inning: 'Inning',
      custom: 'Custom',
    };

    return labels[mode] ?? mode;
  });

  readonly customPeriodLabels = computed(() => this.preset()?.period_labels_json ?? []);

  readonly quickScoreDeltas = computed(() => this.preset()?.quick_score_deltas ?? DEFAULT_QUICK_SCORE_DELTAS);

  readonly gameclockMaxFormatted = computed(() => this.formatSecondsToClock(this.preset()?.gameclock_max));

  readonly initialTimeMinFormatted = computed(() => this.formatSecondsToClock(this.preset()?.initial_time_min_seconds));

  readonly defaultPlayclockFormatted = computed(() => this.formatSecondsToClock(this.preset()?.default_playclock_seconds));

  navigateBack(): void {
    this.navigationHelper.toSportScoreboardPresetList();
  }

  onEdit(): void {
    const id = this.presetId();
    if (id) {
      this.navigationHelper.toSportScoreboardPresetEdit(id);
    }
  }

  onDelete(): void {
    const preset = this.preset();
    const id = this.presetId();
    if (!preset || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete preset "${preset.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.presetStore.delete(id),
      () => this.navigateBack(),
      'Preset'
    );
  }

  private toTitle(value: string | null | undefined): string {
    if (!value) return 'N/A';
    return value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatSecondsToClock(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }

    const totalSeconds = Math.max(0, Math.floor(value));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
