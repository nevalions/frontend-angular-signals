import { ChangeDetectionStrategy, Component, inject, computed, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { SeasonUpdate } from '../../models/season.model';

@Component({
  selector: 'app-season-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './season-edit.component.html',
  styleUrl: './season-edit.component.less',
})
export class SeasonEditComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seasonStore = inject(SeasonStoreService);
  private fb = inject(FormBuilder);

  seasonForm = this.fb.group({
    year: ['', [Validators.min(1900), Validators.max(2999)]],
    description: [''],
  });

  seasonId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? Number(id) : null;
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
        this.seasonForm.patchValue({
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
    if (this.seasonForm.valid && id) {
      const seasonData: SeasonUpdate = {
        year: Number(this.seasonForm.value.year),
        description: this.seasonForm.value.description || null,
      };
      this.seasonStore.updateSeason(id, seasonData).subscribe(() => {
        this.navigateToDetail();
      });
    }
  }
}
