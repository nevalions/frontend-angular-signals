import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Field, required, form } from '@angular/forms/signals';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentCreate } from '../../models/tournament.model';

interface TournamentFormModel {
  title: string;
  description: string;
}

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Field, TuiButton],
  templateUrl: './tournament-create.component.html',
  styleUrl: './tournament-create.component.less',
})
export class TournamentCreateComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);

  sportId = signal<number | null>(null);
  year = signal<number | null>(null);

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s) => s.id === id) || null;
  });

  season = computed(() => {
    const y = this.year();
    if (!y) return null;
    return this.seasonStore.seasonByYear().get(y) || null;
  });

  formModel = signal<TournamentFormModel>({
    title: '',
    description: '',
  });

  tournamentForm = form(this.formModel, (fieldPath) => {
    required(fieldPath.title, { message: 'Title is required' });
  });

  constructor() {
    effect(() => {
      const season = this.season();
      if (season) {
        this.formModel.set({ title: '', description: '' });
      }
    });
  }

  onSubmit(): void {
    if (this.tournamentForm().valid()) {
      const sportId = this.sportId();
      const year = this.year();
      if (!sportId || !year) {
        return;
      }
      const season = this.seasonStore.seasonByYear().get(year);
      if (!season) {
        return;
      }
      const formData = this.formModel();
      const data: TournamentCreate = {
        title: formData.title,
        description: formData.description || null,
        sport_id: sportId,
        season_id: season.id,
      };
      this.tournamentStore.createTournament(data).subscribe(() => {
        this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments']);
      });
    }
  }

  navigateBack(): void {
    const sportId = this.sportId();
    const year = this.year();
    if (sportId && year) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments']);
    }
  }
}
