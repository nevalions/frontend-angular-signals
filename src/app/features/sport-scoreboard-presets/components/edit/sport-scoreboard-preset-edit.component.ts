import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { SportScoreboardPresetUpdate } from '../../models/sport-scoreboard-preset.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import {
  hasInvalidCustomPeriodLabelsInput,
  parseCustomPeriodLabelsInput,
  PERIOD_MODE_OPTIONS,
  serializeCustomPeriodLabelsInput,
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
  selector: 'app-sport-scoreboard-preset-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiLoader, TuiCheckbox],
  templateUrl: './sport-scoreboard-preset-edit.component.html',
  styleUrl: './sport-scoreboard-preset-edit.component.less',
})
export class SportScoreboardPresetEditComponent {
  private presetStore = inject(SportScoreboardPresetStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private route = inject(ActivatedRoute);
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
    score_form_goal_label: [''],
    score_form_goal_emoji: [''],
    scoreboard_goal_text: [''],
  });

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
    return this.presetStore.presets().find((p) => p.id === id) || null;
  });

  loading = computed(() => this.presetStore.loading());

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

  private patchFormOnPresetChange = effect(() => {
    const preset = this.preset();
    if (preset) {
      this.presetForm.patchValue({
        title: preset.title,
        gameclock_max: preset.gameclock_max ?? 720,
        initial_time_mode: preset.initial_time_mode,
        initial_time_min_seconds: preset.initial_time_min_seconds,
        period_clock_variant: preset.period_clock_variant ?? 'per_period',
        direction: preset.direction,
        on_stop_behavior: preset.on_stop_behavior,
        is_qtr: preset.is_qtr,
        is_time: preset.is_time,
        is_playclock: preset.is_playclock,
        is_downdistance: preset.is_downdistance,
        has_timeouts: preset.has_timeouts,
        has_playclock: preset.has_playclock,
        period_mode: preset.period_mode,
        period_count: preset.period_count ?? 4,
        period_labels_input: serializeCustomPeriodLabelsInput(preset.period_labels_json),
        default_playclock_seconds: preset.default_playclock_seconds,
        quick_score_deltas_input: serializeQuickScoreDeltasInput(preset.quick_score_deltas),
        score_form_goal_label: preset.score_form_goal_label ?? '',
        score_form_goal_emoji: preset.score_form_goal_emoji ?? '',
        scoreboard_goal_text: preset.scoreboard_goal_text ?? '',
      });
    }
  });

  onSubmit(): void {
    if (this.presetForm.invalid || this.customPeriodLabelsInvalid() || this.customMinTimeModeInvalid() || this.quickScoreDeltasInvalid()) return;
    const id = this.presetId();
    if (!id) return;

    const formData = this.presetForm.value;
    const quickScoreDeltas = parseQuickScoreDeltasInput(formData.quick_score_deltas_input);

    if (!quickScoreDeltas) {
      return;
    }

    const data: SportScoreboardPresetUpdate = {
      title: formData.title as string,
    };

    if (formData.gameclock_max !== null && formData.gameclock_max !== undefined) {
      data.gameclock_max = Number(formData.gameclock_max);
    }

    if (formData.initial_time_mode) {
      data.initial_time_mode = formData.initial_time_mode as SportScoreboardPresetUpdate['initial_time_mode'];
    }

    if (formData.initial_time_min_seconds !== null && formData.initial_time_min_seconds !== undefined) {
      data.initial_time_min_seconds = Number(formData.initial_time_min_seconds);
    }

    if (formData.direction) {
      data.direction = formData.direction as 'down' | 'up';
    }

    if (formData.period_clock_variant) {
      data.period_clock_variant = formData.period_clock_variant as SportScoreboardPresetUpdate['period_clock_variant'];
    }

    if (formData.on_stop_behavior) {
      data.on_stop_behavior = formData.on_stop_behavior as 'hold' | 'reset';
    }

    if (formData.is_qtr !== null && formData.is_qtr !== undefined) {
      data.is_qtr = formData.is_qtr;
    }

    if (formData.is_time !== null && formData.is_time !== undefined) {
      data.is_time = formData.is_time;
    }

    if (formData.is_playclock !== null && formData.is_playclock !== undefined) {
      data.is_playclock = formData.is_playclock;
    }

    if (formData.is_downdistance !== null && formData.is_downdistance !== undefined) {
      data.is_downdistance = formData.is_downdistance;
    }

    if (formData.has_timeouts !== null && formData.has_timeouts !== undefined) {
      data.has_timeouts = formData.has_timeouts;
    }

    if (formData.has_playclock !== null && formData.has_playclock !== undefined) {
      data.has_playclock = formData.has_playclock;
    }

    if (formData.period_mode) {
      data.period_mode = formData.period_mode as SportScoreboardPresetUpdate['period_mode'];
    }

    if (formData.period_count !== null && formData.period_count !== undefined) {
      data.period_count = Number(formData.period_count);
    }

    data.period_labels_json = formData.period_mode === 'custom'
      ? parseCustomPeriodLabelsInput(formData.period_labels_input)
      : null;

    if (formData.default_playclock_seconds !== null && formData.default_playclock_seconds !== undefined) {
      data.default_playclock_seconds = Number(formData.default_playclock_seconds);
    }

    data.quick_score_deltas = quickScoreDeltas;

    const scoreFormGoalLabel = formData.score_form_goal_label?.trim();
    if (scoreFormGoalLabel) {
      data.score_form_goal_label = scoreFormGoalLabel;
    }

    const scoreFormGoalEmoji = formData.score_form_goal_emoji?.trim();
    if (scoreFormGoalEmoji) {
      data.score_form_goal_emoji = scoreFormGoalEmoji;
    }

    const scoreboardGoalText = formData.scoreboard_goal_text?.trim();
    if (scoreboardGoalText) {
      data.scoreboard_goal_text = scoreboardGoalText;
    }

    withUpdateAlert(
      this.alerts,
      () => this.presetStore.update(id, data),
      () => this.navigateToDetail(),
      'Preset'
    );
  }

  navigateToDetail(): void {
    const id = this.presetId();
    if (id) {
      this.navigationHelper.toSportScoreboardPresetDetail(id);
    }
  }
}
