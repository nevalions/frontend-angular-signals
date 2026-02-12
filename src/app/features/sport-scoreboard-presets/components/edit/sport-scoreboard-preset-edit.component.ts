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
    direction: ['down'],
    on_stop_behavior: ['hold'],
    is_qtr: [true],
    is_time: [true],
    is_playclock: [true],
    is_downdistance: [true],
    has_timeouts: [true],
    has_playclock: [true],
    period_mode: ['qtr'],
    period_labels_input: [''],
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

  private readonly periodMode = toSignal(this.presetForm.controls.period_mode.valueChanges, {
    initialValue: this.presetForm.controls.period_mode.value,
  });

  private readonly periodLabelsInput = toSignal(this.presetForm.controls.period_labels_input.valueChanges, {
    initialValue: this.presetForm.controls.period_labels_input.value,
  });

  readonly isCustomPeriodMode = computed(() => this.periodMode() === 'custom');

  readonly customPeriodLabelsInvalid = computed(() => {
    if (!this.isCustomPeriodMode()) {
      return false;
    }

    return hasInvalidCustomPeriodLabelsInput(this.periodLabelsInput());
  });

  private patchFormOnPresetChange = effect(() => {
    const preset = this.preset();
    if (preset) {
      this.presetForm.patchValue({
        title: preset.title,
        gameclock_max: preset.gameclock_max ?? 720,
        direction: preset.direction,
        on_stop_behavior: preset.on_stop_behavior,
        is_qtr: preset.is_qtr,
        is_time: preset.is_time,
        is_playclock: preset.is_playclock,
        is_downdistance: preset.is_downdistance,
        has_timeouts: preset.has_timeouts,
        has_playclock: preset.has_playclock,
        period_mode: preset.period_mode,
        period_labels_input: serializeCustomPeriodLabelsInput(preset.period_labels_json),
      });
    }
  });

  onSubmit(): void {
    if (this.presetForm.invalid || this.customPeriodLabelsInvalid()) return;
    const id = this.presetId();
    if (!id) return;

    const formData = this.presetForm.value;

    const data: SportScoreboardPresetUpdate = {
      title: formData.title as string,
    };

    if (formData.gameclock_max !== null && formData.gameclock_max !== undefined) {
      data.gameclock_max = Number(formData.gameclock_max);
    }

    if (formData.direction) {
      data.direction = formData.direction as 'down' | 'up';
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

    data.period_labels_json = formData.period_mode === 'custom'
      ? parseCustomPeriodLabelsInput(formData.period_labels_input)
      : null;

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
