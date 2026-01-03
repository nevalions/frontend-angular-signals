import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiButton } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton],
  templateUrl: './tournament-list.component.html',
  styleUrl: './tournament-list.component.less',
})
export class TournamentListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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

  tournaments = computed(() => {
    const sportId = this.sportId();
    const year = this.year();
    if (!sportId || !year) return [];
    const season = this.seasonStore.seasonByYear().get(year);
    if (!season) return [];
    return (
      this.tournamentStore
        .tournamentsBySportAndSeason()
        .get(`${sportId}-${season.id}`) || []
    );
  });

  loading = this.tournamentStore.loading;

  navigateBack(): void {
    const year = this.year();
    if (year) {
      this.router.navigate(['/seasons', 'year', year]);
    }
  }

  navigateToCreate(): void {
    const sportId = this.sportId();
    const year = this.year();
    if (sportId && year) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', 'new']);
    }
  }

  navigateToDetail(id: number): void {
    const sportId = this.sportId();
    const year = this.year();
    if (sportId && year) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', id]);
    }
  }
}
