import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { SportStoreService } from '../../services/sport-store.service';
import { SportCreate } from '../../models/sport.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { SportScoreboardPresetStoreService } from '../../../sport-scoreboard-presets/services/sport-scoreboard-preset-store.service';

@Component({
  selector: 'app-sport-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './sport-create.component.html',
  styleUrl: './sport-create.component.less',
})
export class SportCreateComponent {
  private sportStore = inject(SportStoreService);
  private presetStore = inject(SportScoreboardPresetStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  sportForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    scoreboard_preset_id: [null as number | null],
  });

  presets = this.presetStore.presets;

  onSubmit(): void {
    if (!this.sportForm.valid) return;

    const formData = this.sportForm.value;

    const data: SportCreate = {
      title: formData.title as string,
    };

    if (formData.description) {
      data.description = formData.description as string;
    }

    if (formData.scoreboard_preset_id !== null && formData.scoreboard_preset_id !== undefined) {
      data.scoreboard_preset_id = formData.scoreboard_preset_id as number | null;
    }

    withCreateAlert(
      this.alerts,
      () => this.sportStore.createSport(data),
      () => this.cancel(),
      'Sport'
    );
  }

  cancel(): void {
    this.navigationHelper.toSportsList();
  }
}
