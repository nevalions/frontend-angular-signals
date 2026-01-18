import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { TeamStoreService } from '../../services/team-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EntityHeaderComponent],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.less',
})
export class TeamDetailComponent {
  private route = inject(ActivatedRoute);
  private teamStore = inject(TeamStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  teamId = computed(() => {
    const id = this.route.snapshot.paramMap.get('teamId');
    return id ? Number(id) : null;
  });

  sportId = computed(() => {
    const id = this.route.snapshot.paramMap.get('sportId');
    return id ? Number(id) : null;
  });

  year = computed(() => {
    const year = this.route.snapshot.paramMap.get('year');
    return year ? Number(year) : null;
  });

  tournamentId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? Number(id) : null;
  });

  isInTournamentContext = computed(() => this.tournamentId() !== null);

  customMenuItems = computed<CustomMenuItem[]>(() => {
    if (this.isInTournamentContext()) {
      return [{ id: 'remove-from-tournament', label: 'Remove from tournament', type: 'danger', icon: '@tui.trash' }];
    }
    return [];
  });

  team = computed(() => {
    const id = this.teamId();
    if (!id) return null;
    return this.teamStore.teams().find((t) => t.id === id) || null;
  });

  teamLogoUrl(teamId: number): string | null {
    const team = this.teamStore.teams().find((t) => t.id === teamId);
    return team?.team_logo_icon_url ? buildStaticUrl(team.team_logo_icon_url) : null;
  }

  navigateToEdit(): void {
    const sportId = this.sportId();
    const teamId = this.teamId();
    if (sportId && teamId) {
      this.navigationHelper.toTeamEdit(sportId, teamId);
    }
  }

  deleteTeam(): void {
    const team = this.team();
    const id = this.teamId();
    if (!team || !id) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete team ${team.title}?`,
        content: 'This action cannot be undone!',
      },
      () => this.teamStore.deleteTeam(id),
      () => this.navigateToSportDetail(),
      'Team'
    );
  }

  navigateToSportDetail(): void {
    const sportId = this.sportId();
    const year = this.route.snapshot.queryParamMap.get('year');
    const tournamentId = this.tournamentId();
    const tournamentYear = this.year();

    if (this.isInTournamentContext() && sportId && tournamentYear && tournamentId) {
      this.navigationHelper.toTournamentDetail(sportId, tournamentYear, tournamentId, 'teams');
    } else if (sportId) {
      this.navigationHelper.toSportDetail(sportId, year ? Number(year) : undefined, 'teams');
    }
  }

  onCustomItemClick(itemId: string): void {
    if (itemId === 'remove-from-tournament') {
      const team = this.team();
      const tournamentId = this.tournamentId();
      const teamId = this.teamId();
      if (!team || !tournamentId || !teamId) return;

      withDeleteConfirm(
        this.dialogs,
        this.alerts,
        {
          label: `Remove team "${team.title}" from tournament?`,
          content: 'This action cannot be undone!',
        },
        () => this.teamStore.removeTeamFromTournament(tournamentId, teamId),
        () => this.navigateToSportDetail(),
        'Team'
      );
    }
  }
}
