import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentCreate } from '../../models/tournament.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-create.component.html',
  styleUrl: './tournament-create.component.less',
})
export class TournamentCreateComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private fb = inject(FormBuilder);

  tournamentForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
  });

  sportId = Number(this.route.snapshot.paramMap.get('sportId')) || 0;
  year = Number(this.route.snapshot.paramMap.get('year')) || 0;

  sport = this.sportStore.sports().find((s) => s.id === this.sportId) || null;
  season = this.seasonStore.seasonByYear().get(this.year) || null;

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formData = this.tournamentForm.value;
      const season = this.seasonStore.seasonByYear().get(this.year);
      if (!season) {
        return;
      }
      const data: TournamentCreate = {
        title: formData.title as string,
        description: (formData.description as string) || null,
        sport_id: this.sportId,
        season_id: season.id,
      };
      this.tournamentStore.createTournament(data).subscribe(() => {
        this.navigateBack();
      });
    }
  }

  navigateBack(): void {
    this.router.navigate(['/sports', this.sportId, 'seasons', this.year, 'tournaments']);
  }
}
