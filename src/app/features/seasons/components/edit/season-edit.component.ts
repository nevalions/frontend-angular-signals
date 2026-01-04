import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Field, min, max, form } from '@angular/forms/signals';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { SeasonUpdate } from '../../models/season.model';

interface SeasonFormModel {
  year: string;
  description: string;
}

@Component({
  selector: 'app-season-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Field, TuiButton],
  templateUrl: './season-edit.component.html',
  styleUrl: './season-edit.component.less',
})
export class SeasonEditComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seasonStore = inject(SeasonStoreService);

  seasonId = signal<number | null>(null);
  formModel = signal<SeasonFormModel>({
    year: '',
    description: '',
  });

  seasonForm = form(this.formModel, (fieldPath) => {
    min(fieldPath.year, 1900, { message: 'Year must be at least 1900' });
    max(fieldPath.year, 2999, { message: 'Year must be at most 2999' });
  });

  season = computed(() => {
    const id = this.seasonId();
    if (!id) return null;
    return this.seasonStore.seasons().find((s) => s.id === id) || null;
  });

  private patchFormOnSeasonChange = effect(() => {
    const season = this.season();
    if (season) {
      untracked(() => {
        this.formModel.set({
          year: String(season.year),
          description: season.description || '',
        });
      });
    }
  });

  navigateToDetail(): void {
    const id = this.seasonId();
    if (id) {
      this.router.navigate(['/seasons', id]);
    }
  }

  onSubmit(): void {
    const id = this.seasonId();
    if (this.seasonForm().valid() && id) {
      const formData = this.formModel();
      const seasonData: SeasonUpdate = {
        year: Number(formData.year),
        description: formData.description || null,
      };
      this.seasonStore.updateSeason(id, seasonData).subscribe(() => {
        this.navigateToDetail();
      });
    }
  }
}
