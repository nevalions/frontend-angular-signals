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
import { TeamStoreService } from '../../../teams/services/team-store.service';
import { PositionStoreService } from '../../services/position-store.service';
import { PlayerStoreService } from '../../../players/services/player-store.service';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';
import { Team } from '../../../teams/models/team.model';
import { Position, PositionCreate, PositionUpdate } from '../../models/position.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl } from '../../../../core/config/api.constants';

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
  private teamStore = inject(TeamStoreService);
  private positionStore = inject(PositionStoreService);
  private playerStore = inject(PlayerStoreService);
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

  teams = signal<Team[]>([]);
  teamsLoading = signal(false);
  teamsError = signal<string | null>(null);
  teamSearchQuery = signal('');
  teamsCurrentPage = signal(1);
  teamsItemsPerPage = signal(10);
  teamsTotalCount = signal(0);
  teamsTotalPages = signal(0);

  positions = signal<Position[]>([]);
  positionsLoading = signal(false);
  positionsError = signal<string | null>(null);
  positionSearchQuery = signal('');
  positionsCurrentPage = signal(1);
  positionsItemsPerPage = signal(10);
  positionsTotalPages = signal(0);
  positionFormOpen = signal(false);
  editingPosition = signal<Position | null>(null);
  positionTitle = signal('');

  playersLoading = computed(() => this.playerStore.loading());
  playersError = computed(() => this.playerStore.error());
  playersCurrentPage = signal(1);
  playersItemsPerPage = signal(10);
  playersTotalCount = computed(() => this.playerStore.totalCount());
  playersTotalPages = computed(() => this.playerStore.totalPages());

  private initializePlayers = effect(() => {
    const sportId = this.sportId();
    if (sportId) {
      this.playerStore.setSportId(sportId);
    }
  });

  players = computed(() => this.playerStore.players());
  playersSearch = computed(() => this.playerStore.search());

  playersSortOrder = signal<'asc' | 'desc'>('asc');

  onPlayersSearchChange(query: string): void {
    this.playerStore.setSearch(query);
    this.playersCurrentPage.set(1);
  }

  clearPlayersSearch(): void {
    this.playerStore.setSearch('');
    this.playersCurrentPage.set(1);
  }

  onPlayersPageChange(pageIndex: number): void {
    this.playerStore.setPage(pageIndex + 1);
  }

  onPlayersItemsPerPageChange(itemsPerPage: number): void {
    this.playerStore.setItemsPerPage(itemsPerPage);
  }

  togglePlayersSort(): void {
    this.playersSortOrder.set(this.playersSortOrder() === 'asc' ? 'desc' : 'asc');
    this.playerStore.setSort(this.playersSortOrder());
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

  teamLogoUrl(team: Team): string | null {
    return team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null;
  }

  filteredTeams = computed(() => {
    const query = this.teamSearchQuery().toLowerCase();
    if (!query) return this.teams();
    return this.teams().filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.city && t.city.toLowerCase().includes(query))
    );
  });

  paginatedTeams = computed(() => {
    const start = (this.teamsCurrentPage() - 1) * this.teamsItemsPerPage();
    const end = start + this.teamsItemsPerPage();
    return this.filteredTeams().slice(start, end);
  });

  teamsTotalPagesComputed = computed(() =>
    Math.ceil(this.filteredTeams().length / this.teamsItemsPerPage())
  );

  loadTeams(): void {
    const sportId = this.sportId();
    if (!sportId) return;

    this.teamsLoading.set(true);
    this.teamsError.set(null);

    this.teamStore.getTeamsBySportIdPaginated(
      sportId,
      this.teamsCurrentPage(),
      this.teamsItemsPerPage()
    ).subscribe({
      next: (response) => {
        this.teams.set(response.data);
        this.teamsTotalCount.set(response.metadata.total);
        this.teamsTotalPages.set(response.metadata.total_pages);
        this.teamsLoading.set(false);
      },
      error: () => {
        this.teamsError.set('Failed to load teams');
        this.teamsLoading.set(false);
      }
    });
  }

  onTeamSearchChange(query: string): void {
    this.teamSearchQuery.set(query);
    this.teamsCurrentPage.set(1);
  }

  clearTeamSearch(): void {
    this.teamSearchQuery.set('');
    this.teamsCurrentPage.set(1);
  }

  onTeamsPageChange(pageIndex: number): void {
    this.teamsCurrentPage.set(pageIndex + 1);
  }

  onTeamsItemsPerPageChange(itemsPerPage: number): void {
    this.teamsItemsPerPage.set(itemsPerPage);
    this.teamsCurrentPage.set(1);
  }

  navigateToTeamDetail(teamId: number): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId) {
      this.navigationHelper.toTeamDetail(sportId, teamId, year ?? undefined);
    }
  }

  loadPositions(): void {
    const sportId = this.sportId();
    if (!sportId) return;

    this.positionsLoading.set(true);
    this.positionsError.set(null);

    this.positionStore.getPositionsBySportId(sportId).subscribe({
      next: (positions) => {
        this.positions.set(positions);
        this.positionsLoading.set(false);
      },
      error: () => {
        this.positionsError.set('Failed to load positions');
        this.positionsLoading.set(false);
      }
    });
  }

  filteredPositions = computed(() => {
    const query = this.positionSearchQuery().toLowerCase();
    if (!query) return this.positions();
    return this.positions().filter(p =>
      p.title.toLowerCase().includes(query)
    );
  });

  paginatedPositions = computed(() => {
    const start = (this.positionsCurrentPage() - 1) * this.positionsItemsPerPage();
    const end = start + this.positionsItemsPerPage();
    return this.filteredPositions().slice(start, end);
  });

  positionsTotalPagesComputed = computed(() =>
    Math.ceil(this.filteredPositions().length / this.positionsItemsPerPage())
  );

  onPositionSearchChange(query: string): void {
    this.positionSearchQuery.set(query);
    this.positionsCurrentPage.set(1);
  }

  clearPositionSearch(): void {
    this.positionSearchQuery.set('');
    this.positionsCurrentPage.set(1);
  }

  onPositionsPageChange(pageIndex: number): void {
    this.positionsCurrentPage.set(pageIndex + 1);
  }

  onPositionsItemsPerPageChange(itemsPerPage: number): void {
    this.positionsItemsPerPage.set(itemsPerPage);
    this.positionsCurrentPage.set(1);
  }

  openPositionForm(position: Position | null = null): void {
    this.editingPosition.set(position);
    this.positionTitle.set(position?.title || '');
    this.positionFormOpen.set(true);
  }

  closePositionForm(): void {
    this.positionFormOpen.set(false);
    this.editingPosition.set(null);
    this.positionTitle.set('');
  }

  savePosition(): void {
    const sportId = this.sportId();
    if (!sportId) return;

    const title = this.positionTitle().trim();

    if (!title) return;

    const editing = this.editingPosition();

    if (editing) {
      const updateData: PositionUpdate = {
        title,
        sport_id: sportId,
      };
      this.positionStore.updatePosition(editing.id, updateData).subscribe({
        next: () => {
          this.loadPositions();
          this.closePositionForm();
          this.alerts.open('Position updated successfully', { label: 'Success', appearance: 'positive', autoClose: 3000 });
        },
        error: () => {
          this.alerts.open('Failed to update position', { label: 'Error', appearance: 'negative' });
        }
      });
    } else {
      const createData: PositionCreate = {
        title,
        sport_id: sportId,
      };
      this.positionStore.createPosition(createData).subscribe({
        next: () => {
          this.loadPositions();
          this.closePositionForm();
          this.alerts.open('Position created successfully', { label: 'Success', appearance: 'positive', autoClose: 3000 });
        },
        error: () => {
          this.alerts.open('Failed to create position', { label: 'Error', appearance: 'negative' });
        }
      });
    }
  }

  deletePosition(position: Position): void {
    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete position "${position.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.positionStore.deletePosition(position.id),
      () => this.loadPositions(),
      'Position'
    );
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

  private loadTeamsOnSportChange = effect(() => {
    const sportId = this.sportId();
    if (sportId) {
      this.loadTeams();
    }
  });

  private loadPositionsOnSportChange = effect(() => {
    const sportId = this.sportId();
    if (sportId) {
      this.loadPositions();
    }
  });


  navigateBack(): void {
    this.navigationHelper.toSportsList();
  }

  capitalizeName(name: string | null): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
}
