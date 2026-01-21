import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl } from '../../../../core/config/api.constants';
import { PlayerTeamTournament, PlayerCareer, CareerByTournament, CareerByTeam, PlayerDetailInTournamentResponse } from '../../models/player.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { PlayerStoreService } from '../../services/player-store.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { createNumberParamSignal, createBooleanParamSignal } from '../../../../core/utils/route-param-helper.util';
import { getPlayerName, getPlayerInitials, getPersonPhotoIconUrl, getPersonId, PlayerDetailData } from './player-display.util';
import { TournamentAssignmentComponent } from './tournament-assignment/tournament-assignment.component';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EntityHeaderComponent,
    TuiAvatar,
    TournamentAssignmentComponent
  ],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.less',
})
export class PlayerDetailComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private router = inject(Router);
  private playerStore = inject(PlayerStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  
  private tournamentAssignmentComponent = viewChild<TournamentAssignmentComponent>(TournamentAssignmentComponent);

  playerId = createNumberParamSignal(this.route, 'playerId');

  sportId = createNumberParamSignal(this.route, 'sportId');

  fromSport = createBooleanParamSignal(this.route, 'fromSport', {
    source: 'queryParamMap',
  });

  fromTournamentId = createNumberParamSignal(this.route, 'tournamentId', { source: 'queryParamMap' });

  fromYear = createNumberParamSignal(this.route, 'year', { source: 'queryParamMap' });

  isInSportContext = computed(() => {
    return this.fromSport() === true;
  });

  isInTournamentContext = computed(() => {
    return this.fromTournamentId() !== null;
  });

  customMenuItems = computed<CustomMenuItem[]>(() => {
    if (this.isInSportContext()) {
      return [{ id: 'remove-from-sport', label: 'Remove from sport', type: 'danger', icon: '@tui.trash' }];
    }
    return [];
  });

  playerResource = httpResource<PlayerDetailData>(() => {
    const playerId = this.playerId();
    const fromTournamentId = this.fromTournamentId();
    if (!playerId) return undefined;
    
    if (fromTournamentId) {
      return buildApiUrl(`/api/players/id/${playerId}/in-tournament/${fromTournamentId}`);
    }
    
    return buildApiUrl(`/api/players/id/${playerId}/person`);
  });

  playerCareerResource = httpResource<PlayerCareer>(() => {
    const playerId = this.playerId();
    if (!playerId) return undefined;
    return buildApiUrl(`/api/players/id/${playerId}/career`);
  });

  player = computed(() => {
    const value = this.playerResource.value();
    return value;
  });

  loading = computed(() => this.playerResource.isLoading() || this.playerCareerResource.isLoading());
  error = computed(() => this.playerResource.error() || this.playerCareerResource.error());

  playerName = computed(() => {
    const player = this.player() || null;
    const name = getPlayerName(player);
    return name;
  });

  tournamentAssignment = computed(() => {
    const player = this.player();
    const fromTournamentId = this.fromTournamentId();
    
    if (player && fromTournamentId && 'tournament_assignment' in player) {
      return player.tournament_assignment;
    }
    
    return null;
  });

  tournamentAssignmentId = computed(() => {
    const player = this.player();
    if (!player || !('tournament_assignment' in player)) return null;
    
    const playerDetail = player as PlayerDetailInTournamentResponse;
    const tournamentId = this.fromTournamentId();
    
    if (!tournamentId || !playerDetail.career_by_tournament?.length) return null;
    
    const tournamentCareer = playerDetail.career_by_tournament.find(t => t.tournament_id === tournamentId);
    if (!tournamentCareer?.assignments?.length) return null;
    
    return tournamentCareer.assignments[0].id;
  });

  private syncTournamentAssignment = effect(() => {
    const assignment = this.tournamentAssignment();
    const fromTournamentId = this.fromTournamentId();
    const sportId = this.sportId();
    const tournamentId = this.fromTournamentId();
    const component = this.tournamentAssignmentComponent();
    
    if (assignment && fromTournamentId && sportId && tournamentId && component) {
      component.init({
        teamId: assignment.team_id,
        playerNumber: assignment.player_number,
        positionId: assignment.position_id,
        teamTitle: assignment.team_title,
        positionTitle: assignment.position_title,
        tournamentTitle: assignment.tournament_title,
        tournamentId: tournamentId,
        sportId: sportId,
        assignmentId: this.tournamentAssignmentId()
      }, () => this.playerResource.reload());
    }
  });

  careerByTeam = computed(() => {
    const player = this.player();
    const playerCareer = this.playerCareerResource.value();
    if (!player) return [];
    
    if ('tournament_assignment' in player) {
      const playerDetail = player as PlayerDetailInTournamentResponse;
      return playerDetail.career_by_team;
    }

    if (playerCareer?.career_by_team) {
      return playerCareer.career_by_team;
    }

    if (!player?.player_team_tournaments) return [];

    const teamMap = new Map<number | null, CareerByTeam>();

    player.player_team_tournaments.forEach((ptt: PlayerTeamTournament) => {
      const teamId = ptt.team_id;
      if (teamId !== null && !teamMap.has(teamId)) {
        teamMap.set(teamId, {
          team_id: teamId,
          team_title: (ptt.team_title || 'Unknown Team'),
          assignments: []
        });
      }
      if (teamId !== null) {
        teamMap.get(teamId)!.assignments.push(ptt);
      }
    });

    return Array.from(teamMap.values());
  });

  careerByTournament = computed(() => {
    const player = this.player();
    const playerCareer = this.playerCareerResource.value();
    if (!player) return [];
    
    if ('tournament_assignment' in player) {
      const playerDetail = player as PlayerDetailInTournamentResponse;
      return playerDetail.career_by_tournament;
    }

    if (playerCareer?.career_by_tournament) {
      return playerCareer.career_by_tournament;
    }

    if (!player?.player_team_tournaments) return [];

    const tournamentMap = new Map<number, CareerByTournament>();

    player.player_team_tournaments.forEach((ptt: PlayerTeamTournament) => {
      const tournamentId = ptt.tournament_id;
      if (tournamentId !== null && !tournamentMap.has(tournamentId)) {
        tournamentMap.set(tournamentId, {
          tournament_id: tournamentId,
          tournament_title: 'Unknown Tournament',
          season_id: 0,
          season_year: 0,
          assignments: []
        });
      }
      if (tournamentId !== null) {
        tournamentMap.get(tournamentId)!.assignments.push(ptt);
      }
    });

    return Array.from(tournamentMap.values());
  });

  navigateBack(): void {
    const sportId = this.sportId();
    const fromSport = this.fromSport();
    const fromTournamentId = this.fromTournamentId();
    const fromYear = this.fromYear();

    if (!sportId) return;

    if (!fromSport && fromTournamentId && fromYear) {
      this.navigationHelper.toTournamentDetail(sportId, fromYear, fromTournamentId, 'players');
    } else {
      this.navigationHelper.toSportDetail(sportId, undefined, 'players');
    }
  }

  onEdit(): void {
    const player = this.player();
    if (!player) return;

    const personId = getPersonId(player);

    if (personId) {
      this.navigationHelper.toPersonEdit(personId);
    }
  }

  onCustomItemClick(itemId: string): void {
    if (itemId === 'remove-from-sport') {
      const player = this.player();
      const sportId = this.sportId();
      const personId = player?.id;
      if (!player || !sportId || !personId) return;

      withDeleteConfirm(
        this.dialogs,
        this.alerts,
        {
          label: `Remove player "${this.playerName()}" from this sport?`,
          content: 'This action cannot be undone!',
        },
        () => this.playerStore.removePersonFromSport(personId, sportId),
        () => this.navigateBack(),
        'Player'
      );
    }
  }

  personPhotoIconUrl(): string | null {
    return getPersonPhotoIconUrl(this.player() || null);
  }

  getPlayerInitials(): string {
    return getPlayerInitials(this.player() || null);
  }
}
