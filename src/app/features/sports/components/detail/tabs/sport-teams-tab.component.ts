import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiPagination } from '@taiga-ui/kit';
import { TeamStoreService } from '../../../../teams/services/team-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { buildStaticUrl } from '../../../../../core/config/api.constants';
import { Team } from '../../../../teams/models/team.model';

@Component({
  selector: 'app-sport-teams-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiIcon,
    TuiCardLarge,
    TuiCell,
    TuiAvatar,
    TuiPagination
  ],
  templateUrl: './sport-teams-tab.component.html',
  styleUrl: './sport-teams-tab.component.less',
})
export class SportTeamsTabComponent {
  private teamStore = inject(TeamStoreService);
  private navigationHelper = inject(NavigationHelperService);

  sportId = input.required<number>();
  selectedSeasonYear = input.required<number | null>();

  teams = signal<Team[]>([]);
  teamsLoading = signal(false);
  teamsError = signal<string | null>(null);
  teamSearchQuery = signal('');
  teamsCurrentPage = signal(1);
  teamsItemsPerPage = signal(10);
  teamsTotalCount = signal(0);
  teamsTotalPages = signal(0);

  readonly itemsPerPageOptions = [10, 20, 50];

  private loadTeamsOnSportChange = effect(() => {
    const sportId = this.sportId();
    if (sportId) {
      this.loadTeams();
    }
  });

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

  teamLogoUrl(team: Team): string | null {
    return team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null;
  }

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
}
