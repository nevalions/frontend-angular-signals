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

  onSubmit(): void {
    if (this.presetForm.invalid || this.customPeriodLabelsInvalid()) return;

    const formData = this.presetForm.value;
    const customPeriodLabels = formData.period_mode === 'custom'
      ? parseCustomPeriodLabelsInput(formData.period_labels_input)
      : null;

    const data: SportScoreboardPresetCreate = {
      title: formData.title as string,
      gameclock_max: formData.gameclock_max ? Number(formData.gameclock_max) : null,
      direction: formData.direction as 'down' | 'up',
      on_stop_behavior: formData.on_stop_behavior as 'hold' | 'reset',
      is_qtr: formData.is_qtr ?? true,
      is_time: formData.is_time ?? true,
      is_playclock: formData.is_playclock ?? true,
      is_downdistance: formData.is_downdistance ?? true,
      has_timeouts: formData.has_timeouts ?? true,
      has_playclock: formData.has_playclock ?? true,
      period_mode: (formData.period_mode as SportScoreboardPresetCreate['period_mode']) ?? 'qtr',
      period_labels_json: customPeriodLabels,
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
