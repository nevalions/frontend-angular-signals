import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { SportScoreboardPresetStoreService } from '../../services/sport-scoreboard-preset-store.service';
import { SportScoreboardPresetCreate } from '../../models/sport-scoreboard-preset.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';

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
  });

  readonly directionOptions = DIRECTION_OPTIONS;
  readonly onStopBehaviorOptions = ON_STOP_BEHAVIOR_OPTIONS;

  onSubmit(): void {
    if (this.presetForm.invalid) return;

    const formData = this.presetForm.value;

    const data: SportScoreboardPresetCreate = {
      title: formData.title as string,
      gameclock_max: formData.gameclock_max ? Number(formData.gameclock_max) : null,
      direction: formData.direction as 'down' | 'up',
      on_stop_behavior: formData.on_stop_behavior as 'hold' | 'reset',
      is_qtr: formData.is_qtr ?? true,
      is_time: formData.is_time ?? true,
      is_playclock: formData.is_playclock ?? true,
      is_downdistance: formData.is_downdistance ?? true,
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
