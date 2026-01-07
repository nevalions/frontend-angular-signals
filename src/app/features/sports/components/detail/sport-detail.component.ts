import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDialogService, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiAvatar, TuiChevron, TuiPagination, TuiSelect } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiDataList } from '@taiga-ui/core';
import { TuiActiveZone } from '@taiga-ui/cdk/directives/active-zone';
import { environment } from '../../../../../environments/environment';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { TournamentStoreService } from '../../../tournaments/services/tournament-store.service';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-sport-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, 
    UpperCasePipe, 
    TuiTextfield, 
    TuiChevron, 
    TuiSelect, 
    TuiDataList, 
    TuiButton,
    TuiIcon,
    TuiCardLarge,
    TuiCell,
    TuiAvatar,
    TuiPagination,
    TuiActiveZone
  ],
  templateUrl: './sport-detail.component.html',
  styleUrl: './sport-detail.component.less',
})
export class SportDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sportStore = inject(SportStoreService);
  private seasonStore = inject(SeasonStoreService);
  private tournamentStore = inject(TournamentStoreService);
  private navigationHelper = inject(NavigationHelperService);
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

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  seasons = this.seasonStore.seasons;

  seasonYears = computed(() => this.seasons().map((season: Season) => season.year));

  activeTab = 'tournaments';

  selectedSeasonYear = signal<number | null>(null);

  tournaments = computed(() => {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (!sportId || !year) return [];

    const season = this.seasonStore.seasonByYear().get(year);
    if (!season) return [];

    const key = `${sportId}-${season.id}`;
    const allTournaments = this.tournamentStore.tournamentsBySportAndSeason().get(key) || [];
    
    // Dummy search filtering
    const query = this.searchQuery().toLowerCase();
    if (!query) return allTournaments;
    
    return allTournaments.filter(t => 
      t.title.toLowerCase().includes(query) || 
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  // Dummy search and pagination signals
  searchQuery = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Dummy pagination state
  totalCount = computed(() => this.tournaments().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.itemsPerPage()));
  
  paginatedTournaments = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.tournaments().slice(start, end);
  });

  readonly itemsPerPageOptions = [10, 20, 50];

  menuOpen = signal(false);

  navigateBack(): void {
    this.navigationHelper.toSportsList();
  }

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

  navigateToTournaments(seasonYear: number): void {
    const id = this.sportId();
    if (id) {
      this.router.navigate(['/sports', id, 'seasons', seasonYear, 'tournaments']);
    }
  }

  onSeasonChange(year: number): void {
    this.selectedSeasonYear.set(year);
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }

  navigateToTournamentDetail(tournamentId: number): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, tournamentId);
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onPageChange(pageIndex: number): void {
    this.currentPage.set(pageIndex + 1);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage.set(itemsPerPage);
    this.currentPage.set(1);
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onMenuActiveZoneChange(active: boolean): void {
    if (!active) {
      this.menuOpen.set(false);
    }
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
}
