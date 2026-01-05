import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { SeasonStoreService } from '../../services/season-store.service';
import { SeasonCreate } from '../../models/season.model';

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
      this.seasonStore.createSeason(seasonData).subscribe(() => {
        this.router.navigate(['/seasons']);
      });
    }
  }
}
