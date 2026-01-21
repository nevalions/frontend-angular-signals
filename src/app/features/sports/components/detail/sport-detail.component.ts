import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { TuiDataList } from '@taiga-ui/core';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../services/sport-store.service';
import { PlayerStoreService } from '../../../players/services/player-store.service';
import { Sport } from '../../models/sport.model';
import { Season } from '../../../seasons/models/season.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { createNumberParamSignal, createStringParamSignal } from '../../../../core/utils/route-param-helper.util';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { TabsNavComponent, TabsNavItem } from '../../../../shared/components/tabs-nav/tabs-nav.component';
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
    TabsNavComponent,
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

  sportId = createNumberParamSignal(this.route, 'id');

  queryYear = createNumberParamSignal(this.route, 'year', { source: 'queryParamMap' });

  playersPage = createNumberParamSignal(this.route, 'players_page', {
    source: 'queryParamMap',
    defaultValue: 1,
  });

  playersPerPage = createNumberParamSignal(this.route, 'players_per_page', {
    source: 'queryParamMap',
    defaultValue: 10,
  });

  sport = computed(() => {
    const id = this.sportId();
    if (!id) return null;
    return this.sportStore.sports().find((s: Sport) => s.id === id) || null;
  });

  seasons = this.seasonStore.seasons;

  seasonYears = computed(() => this.seasons().map((season: Season) => season.year));

  customMenuItems = computed<CustomMenuItem[]>(() => {
    if (!this.showParseButton()) return [];
    
    return [
      {
        id: 'parse-eesl',
        label: 'Parse EESL',
        icon: '@tui.download'
      }
    ];
  });

  activeTab = createStringParamSignal(this.route, 'tab', {
    source: 'queryParamMap',
    defaultValue: 'tournaments',
  });

  readonly tabs: TabsNavItem[] = [
    { label: 'Tournaments', value: 'tournaments', icon: '@tui.trophy' },
    { label: 'Teams', value: 'teams', icon: '@tui.users' },
    { label: 'Players', value: 'players', icon: '@tui.user' },
    { label: 'Positions', value: 'positions', icon: '@tui.list' },
  ];

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
    const queryYear = this.queryYear();

    if (!this.selectedSeasonYear() && queryYear) {
      this.selectedSeasonYear.set(queryYear);
    } else if (!this.selectedSeasonYear()) {
      const currentSeason = this.seasonStore.currentSeason();
      if (currentSeason) {
        this.selectedSeasonYear.set(currentSeason.year);
      }
    }
  });

  onSeasonChange(year: number | null): void {
    if (year) {
      this.selectedSeasonYear.set(year);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { year },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  navigateBack(): void {
    this.navigationHelper.toSportsList();
  }

  showParseButton(): boolean {
    const sport = this.sport();
    if (!sport) return false;

    const footballSports = ['football', 'soccer'];
    return footballSports.some(s => sport.title.toLowerCase().includes(s));
  }

  onCustomItemClick(itemId: string): void {
    if (itemId === 'parse-eesl') {
      this.navigateToParseEesl();
    }
  }

  navigateToParseEesl(): void {
    const sportId = this.sportId();
    const selectedYear = this.selectedSeasonYear();
    if (sportId) {
      this.router.navigate(['/sports', sportId, 'parse-eesl'], { queryParams: selectedYear ? { year: selectedYear } : {} });
    }
  }
}
