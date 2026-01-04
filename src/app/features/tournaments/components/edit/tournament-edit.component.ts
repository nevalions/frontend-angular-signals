import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Field, required, form } from '@angular/forms/signals';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentUpdate } from '../../models/tournament.model';

interface TournamentFormModel {
  title: string;
  description: string;
}

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Field, TuiButton],
  templateUrl: './tournament-edit.component.html',
  styleUrl: './tournament-edit.component.less',
})
export class TournamentEditComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);

  sportId = signal<number | null>(null);
  year = signal<number | null>(null);
  tournamentId = signal<number | null>(null);

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

  tournament = computed(() => {
    const id = this.tournamentId();
    if (!id) return null;
    return this.tournamentStore.tournaments().find((t) => t.id === id) || null;
  });

  loading = this.tournamentStore.loading;

  formModel = signal<TournamentFormModel>({
    title: '',
    description: '',
  });

  tournamentForm = form(this.formModel, (fieldPath) => {
    required(fieldPath.title, { message: 'Title is required' });
  });

  constructor() {
    effect(() => {
      const tournament = this.tournament();
      if (tournament) {
        untracked(() => {
          this.formModel.set({
            title: tournament.title,
            description: tournament.description || '',
          });
        });
      }
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    const id = this.tournamentId();
    if (this.tournamentForm().valid() && id) {
      const formData = this.formModel();
      const data: TournamentUpdate = {
        title: formData.title,
        description: formData.description || null,
      };
      this.tournamentStore.updateTournament(id, data).subscribe(() => {
        this.navigateBack();
      });
    }
  }

  navigateBack(): void {
    const sportId = this.sportId();
    const year = this.year();
    const id = this.tournamentId();
    if (sportId && year && id) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', id]);
    }
  }
}
