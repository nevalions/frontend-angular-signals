import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Field, required, min, max, form } from '@angular/forms/signals';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { SeasonCreate } from '../../models/season.model';

interface SeasonFormModel {
  year: string;
  description: string;
}

@Component({
  selector: 'app-season-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Field, TuiButton],
  templateUrl: './season-create.component.html',
  styleUrl: './season-create.component.less',
})
export class SeasonCreateComponent {
  private router = inject(Router);
  private seasonStore = inject(SeasonStoreService);

  formModel = signal<SeasonFormModel>({
    year: '',
    description: '',
  });

  seasonForm = form(this.formModel, (fieldPath) => {
    required(fieldPath.year, { message: 'Year is required' });
    min(fieldPath.year, 1900, { message: 'Year must be at least 1900' });
    max(fieldPath.year, 2999, { message: 'Year must be at most 2999' });
  });

  navigateToList(): void {
    this.router.navigate(['/seasons']);
  }

  onSubmit(): void {
    if (this.seasonForm().valid()) {
      const formData = this.formModel();
      const seasonData: SeasonCreate = {
        year: Number(formData.year),
        description: formData.description || null,
      };
      this.seasonStore.createSeason(seasonData).subscribe(() => {
        this.router.navigate(['/seasons']);
      });
    }
  }
}
