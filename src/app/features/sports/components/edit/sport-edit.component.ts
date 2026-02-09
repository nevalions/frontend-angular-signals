import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { SportStoreService } from '../../services/sport-store.service';
import { SportUpdate } from '../../models/sport.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { SportScoreboardPresetStoreService } from '../../../sport-scoreboard-presets/services/sport-scoreboard-preset-store.service';

@Component({
  selector: 'app-sport-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './sport-edit.component.html',
  styleUrl: './sport-edit.component.less',
})
export class SportEditComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private sportStore = inject(SportStoreService);
  private presetStore = inject(SportScoreboardPresetStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  sportForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    scoreboard_preset_id: [null as number | null],
  });

  presets = this.presetStore.presets;

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s) => s.id === id) || null;
  });

  loading = computed(() => this.sportStore.loading());

  private patchFormOnSportChange = effect(() => {
    const sport = this.sport();
    if (sport) {
      this.sportForm.patchValue({
        title: sport.title,
        description: sport.description || '',
        scoreboard_preset_id: sport.scoreboard_preset_id || null,
      });
    }
  });

  onSubmit(): void {
    if (this.sportForm.valid) {
      const id = this.sportId();
      if (!id) return;

      const formData = this.sportForm.value;

      const data: SportUpdate = {
        title: formData.title as string,
      };

      if (formData.description) {
        data.description = formData.description as string;
      }

      if (formData.scoreboard_preset_id !== null && formData.scoreboard_preset_id !== undefined) {
        data.scoreboard_preset_id = formData.scoreboard_preset_id as number | null;
      }

      withUpdateAlert(
        this.alerts,
        () => this.sportStore.updateSport(id, data),
        () => this.cancel(),
        'Sport'
      );
    }
  }

  cancel(): void {
    const id = this.sportId();
    if (id) {
      this.navigationHelper.toSportDetail(id);
    }
  }
}
