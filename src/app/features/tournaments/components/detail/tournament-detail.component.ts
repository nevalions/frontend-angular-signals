import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { TournamentStoreService } from '../../services/tournament-store.service';
import { SeasonStoreService } from '../../../seasons/services/season-store.service';
import { SportStoreService } from '../../../sports/services/sport-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { TabsNavComponent, TabsNavItem } from '../../../../shared/components/tabs-nav/tabs-nav.component';
import { TournamentMatchesTabComponent } from './tabs/tournament-matches-tab.component';
import { TournamentTeamsTabComponent } from './tabs/tournament-teams-tab.component';
import { TournamentPlayersTabComponent } from './tabs/tournament-players-tab.component';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { createNumberParamSignal, createStringParamSignal } from '../../../../core/utils/route-param-helper.util';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent, TabsNavComponent, TournamentMatchesTabComponent, TournamentTeamsTabComponent, TournamentPlayersTabComponent],
  templateUrl: './tournament-detail.component.html',
  styleUrl: './tournament-detail.component.less',
})
export class TournamentDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentStore = inject(TournamentStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private seasonStore = inject(SeasonStoreService);
  private sportStore = inject(SportStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  sportId = createNumberParamSignal(this.route, 'sportId');

  year = createNumberParamSignal(this.route, 'year');

  tournamentId = createNumberParamSignal(this.route, 'id');

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

  tournamentLogoUrl = computed(() => {
    const t = this.tournament();
    return t?.tournament_logo_icon_url ? buildStaticUrl(t.tournament_logo_icon_url) : null;
  });

  activeTab = createStringParamSignal(this.route, 'tab', {
    source: 'queryParamMap',
    defaultValue: 'matches',
  });

  readonly tabs: TabsNavItem[] = [
    { label: 'Matches', value: 'matches', icon: '@tui.calendar' },
    { label: 'Teams', value: 'teams', icon: '@tui.users' },
    { label: 'Players', value: 'players', icon: '@tui.user' },
  ];

  customMenuItems = computed<CustomMenuItem[]>(() => {
    const tournament = this.tournament();
    if (!tournament?.tournament_eesl_id) return [];

    return [
      {
        id: 'parse-eesl-teams',
        label: 'Parse EESL Teams',
        icon: '@tui.users'
      },
      {
        id: 'parse-eesl-matches',
        label: 'Parse EESL Matches',
        icon: '@tui.calendar'
      }
    ];
  });

  navigateBack(): void {
    const sportId = this.sportId();
    const year = this.year();
    if (sportId && year) {
      this.navigationHelper.toSportDetail(sportId, year);
    }
  }

  navigateToEdit(): void {
    const sportId = this.sportId();
    const year = this.year();
    const id = this.tournamentId();
    if (sportId && year && id) {
      this.navigationHelper.toTournamentEdit(sportId, year, id);
    }
  }

  deleteTournament(): void {
    const id = this.tournamentId();
    const tournament = this.tournament();
    if (!tournament || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete tournament "${tournament.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.tournamentStore.deleteTournament(id),
      () => this.navigateBack(),
      'Tournament'
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

  onCustomItemClick(itemId: string): void {
    if (itemId === 'parse-eesl-teams') {
      this.navigateToParseEesl();
    } else if (itemId === 'parse-eesl-matches') {
      this.navigateToParseMatches();
    }
  }

  navigateToParseEesl(): void {
    const sportId = this.sportId();
    const year = this.year();
    const id = this.tournamentId();
    if (sportId && year && id) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', id, 'parse-eesl']);
    }
  }

  navigateToParseMatches(): void {
    const sportId = this.sportId();
    const year = this.year();
    const id = this.tournamentId();
    if (sportId && year && id) {
      this.router.navigate(['/sports', sportId, 'seasons', year, 'tournaments', id, 'parse-matches']);
    }
  }
}
