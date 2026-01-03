import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season, SeasonUpdate } from '../../models/season.model';

@Component({
  selector: 'app-season-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiButton],
  templateUrl: './season-edit.component.html',
  styleUrl: './season-edit.component.less',
})
export class SeasonEditComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seasonStore = inject(SeasonStoreService);

  seasonForm: FormGroup = this.fb.group({
    year: ['', [Validators.required, Validators.min(1900), Validators.max(2999)]],
    description: [''],
  });

  seasonId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

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
          year: season.year,
          description: season.description,
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
        year: this.seasonForm.value.year,
        description: this.seasonForm.value.description,
      };

      this.seasonStore.updateSeason(id, seasonData).subscribe(() => {
        this.navigateToDetail();
      });
    }
  }

  get yearControl() {
    return this.seasonForm.get('year');
  }

  get descriptionControl() {
    return this.seasonForm.get('description');
  }
}
