import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield, TuiButton, TuiAlertService, TuiDataList } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TeamStoreService } from '../../../../teams/services/team-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { buildStaticUrl } from '../../../../../core/config/api.constants';
import { Team } from '../../../../teams/models/team.model';
import { UpperCasePipe } from '@angular/common';
import { withCreateAlert } from '../../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-tournament-teams-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UpperCasePipe,
    TuiTextfield,
    TuiButton,
    TuiDataList,
    TuiChevron,
    TuiComboBox,
    TuiFilterByInputPipe,
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
  private alerts = inject(TuiAlertService);

  tournamentId = input.required<number>();
  sportId = input.required<number>();
  selectedSeasonYear = input.required<number | null>();

  teams = signal<Team[]>([]);
  teamsLoading = signal(false);
  teamsError = signal<string | null>(null);
  teamSearchQuery = signal('');

  availableTeams = signal<Team[]>([]);
  availableTeamsLoading = signal(false);
  availableTeamsError = signal<string | null>(null);
  showAddTeamForm = signal(false);
  selectedTeam = signal<Team | null>(null);

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

  toggleAddTeamForm(): void {
    if (!this.showAddTeamForm()) {
      this.loadAvailableTeams();
    }
    this.showAddTeamForm.update(v => !v);
  }

  loadAvailableTeams(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.availableTeamsLoading.set(true);
    this.availableTeamsError.set(null);

    this.teamStore.getAvailableTeamsForTournament(tournamentId).pipe(
      tap((teams: Team[]) => {
        const sortedTeams = Array.isArray(teams)
          ? [...teams].sort((a, b) => a.title.localeCompare(b.title))
          : [];
        this.availableTeams.set(sortedTeams);
        this.availableTeamsLoading.set(false);
      }),
      catchError((_err) => {
        this.availableTeamsError.set('Failed to load available teams');
        this.availableTeamsLoading.set(false);
        this.availableTeams.set([]);
        return EMPTY;
      })
    ).subscribe();
  }

  addTeam(): void {
    const tournamentId = this.tournamentId();
    const team = this.selectedTeam();
    if (!tournamentId || !team) return;

    withCreateAlert(
      this.alerts,
      () => this.teamStore.addTeamToTournament(tournamentId, team.id),
      () => this.onAddTeamSuccess(),
      'Team'
    );
  }

  onAddTeamSuccess(): void {
    this.loadTeams();
    this.showAddTeamForm.set(false);
    this.selectedTeam.set(null);
  }

  cancelAddTeam(): void {
    this.showAddTeamForm.set(false);
    this.selectedTeam.set(null);
  }

  stringifyTeam(team: Team): string {
    return team.title;
  }
}
