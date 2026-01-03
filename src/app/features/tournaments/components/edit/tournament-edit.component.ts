import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { TournamentUpdate } from '../../models/tournament.model';

@Component({
  selector: 'app-tournament-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-edit.component.html',
  styleUrl: './tournament-edit.component.less',
})
export class TournamentEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tournamentStore = inject(TournamentStoreService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  year = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  tournamentId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

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

  tournamentForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const tournament = this.tournament();
      if (tournament) {
        this.tournamentForm.patchValue({
          title: tournament.title,
          description: tournament.description,
        });
      }
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const id = this.tournamentId();
      if (!id) return;
      const data: TournamentUpdate = {
        title: this.tournamentForm.value.title as string,
        description: this.tournamentForm.value.description as string | null,
      };
      this.tournamentStore.updateTournament(id, data).subscribe(() => {
        const sportId = this.sportId();
        const year = this.year();
        if (sportId && year) {
          this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', id]);
        }
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

  get titleControl() {
    return this.tournamentForm.get('title');
  }

  get descriptionControl() {
    return this.tournamentForm.get('description');
  }
}
