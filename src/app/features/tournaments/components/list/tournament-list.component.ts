import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { TuiChevron, TuiSelect } from '@taiga-ui/kit';
import { TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { environment } from '../../../../../environments/environment';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { Season } from '../../../seasons/models/season.model';


@Component({
  selector: 'app-tournament-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TuiButton, TuiTextfield, TuiChevron, TuiSelect, TuiDataList],
  templateUrl: './tournament-list.component.html',
  styleUrl: './tournament-list.component.less',
})
export class TournamentListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navigationHelper = inject(NavigationHelperService);
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

  initialYear = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  seasons = this.seasonStore.seasons;

  seasonYears = computed(() => this.seasons().map((season: Season) => season.year));

  selectedSeasonYear = signal<number | null>(null);

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s) => s.id === id) || null;
  });

  season = computed(() => {
    const year = this.selectedSeasonYear();
    if (!year) return null;
    return this.seasonStore.seasonByYear().get(year) || null;
  });

  tournaments = computed(() => {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
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

  onSeasonChange(year: number): void {
    const sportId = this.sportId();
    if (sportId) {
      this.navigationHelper.toTournamentsList(sportId, year);
    }
  }

  navigateBack(): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId) {
      this.navigationHelper.toSportDetail(sportId, year ?? undefined);
    }
  }

  navigateToCreate(): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId && year) {
      this.navigationHelper.toTournamentCreate(sportId, year);
    }
  }

  navigateToDetail(id: number): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, id);
    }
  }

  private setCurrentSeason = effect(() => {
    const seasons = this.seasons();
    const initialYear = this.initialYear();
    
    if (!this.selectedSeasonYear() && initialYear) {
      this.selectedSeasonYear.set(initialYear);
    } else if (!this.selectedSeasonYear()) {
      const currentSeason = seasons.find(s => s.id === environment.currentSeasonId);
      if (currentSeason) {
        this.selectedSeasonYear.set(currentSeason.year);
      }
    }
  });
}
