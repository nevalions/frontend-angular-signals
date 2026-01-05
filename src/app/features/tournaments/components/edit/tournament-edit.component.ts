import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-edit.component.html',
  styleUrl: './tournament-edit.component.less',
})
export class TournamentEditComponent implements OnInit {
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

  sportId = this.route.snapshot.paramMap.get('sportId') || '';
  year = this.route.snapshot.paramMap.get('year') || '';
  tournamentId = this.route.snapshot.paramMap.get('id') || '';

  sport = this.sportStore.sports().find((s) => s.id === Number(this.sportId)) || null;
  season = this.seasonStore.seasonByYear().get(Number(this.year)) || null;
  tournament = this.tournamentStore.tournaments().find((t) => t.id === Number(this.tournamentId)) || null;
  loading = this.tournamentStore.loading;

  ngOnInit(): void {
    if (this.tournament) {
      this.tournamentForm.patchValue({
        title: this.tournament.title,
        description: this.tournament.description || '',
      });
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid && this.tournamentId) {
      const formData = this.tournamentForm.value;
      this.tournamentStore.updateTournament(Number(this.tournamentId), {
        title: formData.title as string,
        description: formData.description || null,
      }).subscribe(() => {
        this.cancel();
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/sports', this.sportId, 'seasons', this.year, 'tournaments']);
  }
}
