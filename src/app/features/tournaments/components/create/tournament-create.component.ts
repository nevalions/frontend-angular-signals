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
import { TournamentCreate } from '../../models/tournament.model';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiButton],
  templateUrl: './tournament-create.component.html',
  styleUrl: './tournament-create.component.less',
})
export class TournamentCreateComponent implements OnInit {
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

  tournamentForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const season = this.season();
      if (season) {
        this.tournamentForm.patchValue({});
      }
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const sportId = this.sportId();
      const year = this.year();
      if (!sportId || !year) {
        return;
      }
      const season = this.seasonStore.seasonByYear().get(year);
      if (!season) {
        return;
      }
      const data: TournamentCreate = {
        title: this.tournamentForm.value.title as string,
        description: this.tournamentForm.value.description as string | null,
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

  get titleControl() {
    return this.tournamentForm.get('title');
  }

  get descriptionControl() {
    return this.tournamentForm.get('description');
  }
}
