import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { Season, SeasonUpdate } from '../../models/season.model';

@Component({
  selector: 'app-season-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiButton],
  templateUrl: './season-edit.component.html',
  styleUrl: './season-edit.component.less',
})
export class SeasonEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seasonStore = inject(SeasonStoreService);

  seasonForm: FormGroup = this.fb.group({
    year: ['', [Validators.required, Validators.min(1900), Validators.max(2999)]],
    description: [''],
  });

  seasonId: number | null = null;
  season: Season | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.seasonId = Number(idParam);
      this.season = this.seasonStore.seasons().find((s) => s.id === this.seasonId) || null;

      if (this.season) {
        this.seasonForm.patchValue({
          year: this.season.year,
          description: this.season.description,
        });
      }
    }
  }

  navigateToDetail(): void {
    if (this.seasonId) {
      this.router.navigate(['/seasons', this.seasonId]);
    }
  }

  onSubmit(): void {
    if (this.seasonForm.valid && this.seasonId) {
      const seasonData: SeasonUpdate = {
        year: this.seasonForm.value.year,
        description: this.seasonForm.value.description,
      };

      this.seasonStore.updateSeason(this.seasonId, seasonData).subscribe(() => {
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
