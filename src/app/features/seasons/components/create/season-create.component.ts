import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { SeasonCreate } from '../../models/season.model';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-season-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './season-create.component.html',
  styleUrl: './season-create.component.less',
})
export class SeasonCreateComponent {
  private router = inject(Router);
  private seasonStore = inject(SeasonStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  seasonForm = this.fb.group({
    year: ['', [Validators.required, Validators.min(1900), Validators.max(2999)]],
    description: [''],
  });

  navigateToList(): void {
    this.router.navigate(['/seasons']);
  }

  onSubmit(): void {
    if (this.seasonForm.valid) {
      const seasonData: SeasonCreate = {
        year: Number(this.seasonForm.value.year),
        description: this.seasonForm.value.description || null,
      };
      withCreateAlert(
        this.alerts,
        () => this.seasonStore.createSeason(seasonData),
        () => this.router.navigate(['/seasons']),
        'Season'
      );
    }
  }
}
