import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { TuiDataList } from '@taiga-ui/core';
import { environment } from '../../../../../environments/environment';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { PlayerStoreService } from '../../../players/services/player-store.service';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
  import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
  import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
  import { SportTournamentsTabComponent } from './tabs/sport-tournaments-tab.component';
  import { SportTeamsTabComponent } from './tabs/sport-teams-tab.component';
  import { SportPlayersTabComponent } from './tabs/sport-players-tab.component';
  import { SportPositionsTabComponent } from './tabs/sport-positions-tab.component';

@Component({
  selector: 'app-sport-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiTextfield,
    TuiSelect,
    TuiDataList,
    EntityHeaderComponent,
    SportTournamentsTabComponent,
    SportTeamsTabComponent,
    SportPlayersTabComponent,
    SportPositionsTabComponent
  ],
  templateUrl: './sport-detail.component.html',
  styleUrl: './sport-detail.component.less',
})
export class SportDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);
  private playerStore = inject(PlayerStoreService);
  private readonly navigationHelper = inject(NavigationHelperService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: null }
  );

  queryYear = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  playersPage = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('players_page');
      return val ? Number(val) : 1;
    })),
    { initialValue: 1 }
  );

  playersPerPage = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('players_per_page');
      return val ? Number(val) : 10;
    })),
    { initialValue: 10 }
  );

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  seasons = this.seasonStore.seasons;

  seasonYears = computed(() => this.seasons().map((season: Season) => season.year));

  activeTab = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('tab') || 'tournaments')),
    { initialValue: 'tournaments' }
  );

  selectedSeasonYear = signal<number | null>(null);

  private initializePlayers = effect(() => {
    const sportId = this.sportId();
    if (sportId) {
      this.playerStore.setSportId(sportId);
    }
  });

  navigateToEdit(): void {
    const id = this.sportId();
    if (id) {
      this.navigationHelper.toSportEdit(id);
    }
  }

  deleteSport(): void {
    const id = this.sportId();
    const sport = this.sport();
    if (!sport || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete sport "${sport.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.sportStore.deleteSport(id),
      () => this.navigateBack(),
      'Sport'
    );
  }

  onTabChange(tab: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private setCurrentSeason = effect(() => {
    const seasons = this.seasons();
    const queryYear = this.queryYear();

    if (!this.selectedSeasonYear() && queryYear) {
      this.selectedSeasonYear.set(queryYear);
    } else if (!this.selectedSeasonYear()) {
      const currentSeason = seasons.find(s => s.id === environment.currentSeasonId);
      if (currentSeason) {
        this.selectedSeasonYear.set(currentSeason.year);
      }
    }
  });

  navigateBack(): void {
    this.navigationHelper.toSportsList();
  }

  showParseButton(): boolean {
    const sport = this.sport();
    if (!sport) return false;
    
    // Show parse button only for football
    const footballSports = ['football', 'soccer'];
    return footballSports.some(s => sport.title.toLowerCase().includes(s));
  }

  navigateToParseEesl(): void {
    const sportId = this.sportId();
    if (sportId) {
      // Preserve the current year query parameter
      const year = this.route.snapshot.queryParamMap.get('year');
      this.router.navigate(['/sports', sportId, 'parse-eesl'], { queryParams: year ? { year } : {} });
    }
  }
}
