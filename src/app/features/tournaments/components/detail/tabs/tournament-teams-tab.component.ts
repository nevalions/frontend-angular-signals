import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { TuiTextfield, TuiButton } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar } from '@taiga-ui/kit';
import { TeamStoreService } from '../../../../teams/services/team-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { buildStaticUrl } from '../../../../../core/config/api.constants';
import { Team } from '../../../../teams/models/team.model';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-tournament-teams-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    TuiTextfield,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiAvatar
  ],
  templateUrl: './tournament-teams-tab.component.html',
  styleUrl: './tournament-teams-tab.component.less',
})
export class TournamentTeamsTabComponent {
  private teamStore = inject(TeamStoreService);
  private navigationHelper = inject(NavigationHelperService);

  tournamentId = input.required<number>();
  sportId = input.required<number>();
  selectedSeasonYear = input.required<number | null>();

  teams = signal<Team[]>([]);
  teamsLoading = signal(false);
  teamsError = signal<string | null>(null);
  teamSearchQuery = signal('');

  filteredTeams = computed(() => {
    const query = this.teamSearchQuery().toLowerCase();
    if (!query) return this.teams();
    return this.teams().filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.city && t.city.toLowerCase().includes(query))
    );
  });

  private loadTeamsOnTournamentChange = effect(() => {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.loadTeams();
    }
  });

  teamLogoUrl(team: Team): string | null {
    return team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null;
  }

  loadTeams(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.teamsLoading.set(true);
    this.teamsError.set(null);

    this.teamStore.getTeamsByTournamentId(tournamentId).subscribe({
      next: (teams) => {
        this.teams.set(teams);
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
  }

  clearTeamSearch(): void {
    this.teamSearchQuery.set('');
  }

  navigateToTeamDetail(teamId: number): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    const tournamentId = this.tournamentId();
    if (sportId && year && tournamentId) {
      this.navigationHelper.toTeamInTournamentDetail(sportId, year, tournamentId, teamId);
    }
  }
}
