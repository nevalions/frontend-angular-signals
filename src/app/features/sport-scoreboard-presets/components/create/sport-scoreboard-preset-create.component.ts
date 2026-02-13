import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { SportScoreboardPresetCreate } from '../../models/sport-scoreboard-preset.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import {
  hasInvalidCustomPeriodLabelsInput,
  parseCustomPeriodLabelsInput,
  PERIOD_MODE_OPTIONS,
  INITIAL_TIME_MODE_OPTIONS,
  PERIOD_CLOCK_VARIANT_OPTIONS,
  validateInitialTimeMinSeconds,
  getQuickScoreDeltasValidationError,
  parseQuickScoreDeltasInput,
  serializeQuickScoreDeltasInput,
} from '../../utils/period-labels-form.util';

const DIRECTION_OPTIONS = [
  { value: 'down', label: 'Down' },
  { value: 'up', label: 'Up' },
] as const;

const ON_STOP_BEHAVIOR_OPTIONS = [
  { value: 'hold', label: 'Hold' },
  { value: 'reset', label: 'Reset' },
] as const;

@Component({
  selector: 'app-sport-scoreboard-preset-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiCheckbox],
  templateUrl: './sport-scoreboard-preset-create.component.html',
  styleUrl: './sport-scoreboard-preset-create.component.less',
})
export class SportScoreboardPresetCreateComponent {
  private presetStore = inject(SportScoreboardPresetStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  presetForm = this.fb.group({
    title: ['', [Validators.required]],
    gameclock_max: [720],
    initial_time_mode: ['max'],
    initial_time_min_seconds: [null as number | null],
    period_clock_variant: ['per_period'],
    direction: ['down'],
    on_stop_behavior: ['hold'],
    is_qtr: [true],
    is_time: [true],
    is_playclock: [true],
    is_downdistance: [true],
    has_timeouts: [true],
    has_playclock: [true],
    period_mode: ['qtr'],
    period_count: [4],
    period_labels_input: [''],
    default_playclock_seconds: [null as number | null],
    quick_score_deltas_input: [serializeQuickScoreDeltasInput(null)],
  });

  readonly directionOptions = DIRECTION_OPTIONS;
  readonly onStopBehaviorOptions = ON_STOP_BEHAVIOR_OPTIONS;
  readonly periodModeOptions = PERIOD_MODE_OPTIONS;
  readonly initialTimeModeOptions = INITIAL_TIME_MODE_OPTIONS;
  readonly periodClockVariantOptions = PERIOD_CLOCK_VARIANT_OPTIONS;

  private readonly periodMode = toSignal(this.presetForm.controls.period_mode.valueChanges, {
    initialValue: this.presetForm.controls.period_mode.value,
  });

  private readonly initialTimeMode = toSignal(this.presetForm.controls.initial_time_mode.valueChanges, {
    initialValue: this.presetForm.controls.initial_time_mode.value,
  });

  private readonly periodLabelsInput = toSignal(this.presetForm.controls.period_labels_input.valueChanges, {
    initialValue: this.presetForm.controls.period_labels_input.value,
  });

  private readonly initialTimeMinSeconds = toSignal(this.presetForm.controls.initial_time_min_seconds.valueChanges, {
    initialValue: this.presetForm.controls.initial_time_min_seconds.value,
  });

  private readonly quickScoreDeltasInput = toSignal(this.presetForm.controls.quick_score_deltas_input.valueChanges, {
    initialValue: this.presetForm.controls.quick_score_deltas_input.value,
  });

  readonly isCustomPeriodMode = computed(() => this.periodMode() === 'custom');

  readonly isCustomMinTimeMode = computed(() => this.initialTimeMode() === 'min');

  readonly customPeriodLabelsInvalid = computed(() => {
    if (!this.isCustomPeriodMode()) {
      return false;
    }

    return hasInvalidCustomPeriodLabelsInput(this.periodLabelsInput());
  });

  readonly customMinTimeModeInvalid = computed(() => {
    return !validateInitialTimeMinSeconds(
      this.initialTimeMode() as 'max' | 'min' | 'zero' | null,
      this.initialTimeMinSeconds()
    );
  });

  readonly quickScoreDeltasValidationError = computed(() => {
    return getQuickScoreDeltasValidationError(this.quickScoreDeltasInput());
  });

  readonly quickScoreDeltasInvalid = computed(() => this.quickScoreDeltasValidationError() !== null);

  onSubmit(): void {
    if (this.presetForm.invalid || this.customPeriodLabelsInvalid() || this.customMinTimeModeInvalid() || this.quickScoreDeltasInvalid()) return;

    const formData = this.presetForm.value;
    const customPeriodLabels = formData.period_mode === 'custom'
      ? parseCustomPeriodLabelsInput(formData.period_labels_input)
      : null;
    const quickScoreDeltas = parseQuickScoreDeltasInput(formData.quick_score_deltas_input);

    if (!quickScoreDeltas) {
      return;
    }

    const data: SportScoreboardPresetCreate = {
      title: formData.title as string,
      gameclock_max: formData.gameclock_max ? Number(formData.gameclock_max) : null,
      initial_time_mode: (formData.initial_time_mode as SportScoreboardPresetCreate['initial_time_mode']) ?? 'max',
      initial_time_min_seconds: formData.initial_time_min_seconds ? Number(formData.initial_time_min_seconds) : null,
      period_clock_variant: (formData.period_clock_variant as SportScoreboardPresetCreate['period_clock_variant']) ?? 'per_period',
      direction: formData.direction as 'down' | 'up',
      on_stop_behavior: formData.on_stop_behavior as 'hold' | 'reset',
      is_qtr: formData.is_qtr ?? true,
      is_time: formData.is_time ?? true,
      is_playclock: formData.is_playclock ?? true,
      is_downdistance: formData.is_downdistance ?? true,
      has_timeouts: formData.has_timeouts ?? true,
      has_playclock: formData.has_playclock ?? true,
      period_mode: (formData.period_mode as SportScoreboardPresetCreate['period_mode']) ?? 'qtr',
      period_count: formData.period_count ? Number(formData.period_count) : 4,
      period_labels_json: customPeriodLabels,
      default_playclock_seconds: formData.default_playclock_seconds ? Number(formData.default_playclock_seconds) : null,
      quick_score_deltas: quickScoreDeltas,
    };

    withCreateAlert(
      this.alerts,
      () => this.presetStore.create(data),
      () => this.navigateToList(),
      'Preset'
    );
  }

  navigateToList(): void {
    this.navigationHelper.toSportScoreboardPresetList();
  }
}
