import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiDataList, TuiTextfield, TuiIcon } from '@taiga-ui/core';
import { TuiAvatar, TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl, buildStaticUrl } from '../../../../core/config/api.constants';
import { PlayerWithPersonAndTournaments, PlayerTeamTournament, PlayerCareer, CareerByTournament, CareerByTeam, PlayerDetailInTournamentResponse } from '../../models/player.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { PlayerStoreService } from '../../services/player-store.service';
import { TeamStoreService } from '../../../teams/services/team-store.service';
import { PositionStoreService } from '../../../sports/services/position-store.service';
import { Team, Position } from '../../../../shared/types';
import { withDeleteConfirm, withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { capitalizeName as capitalizeNameUtil } from '../../../../core/utils/string-helper.util';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EntityHeaderComponent,
    FormsModule,
    TuiDataList,
    TuiTextfield,
    TuiIcon,
    TuiAvatar,
    TuiChevron,
    TuiComboBox,
    TuiFilterByInputPipe
  ],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.less',
})
export class PlayerDetailComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private router = inject(Router);
  private playerStore = inject(PlayerStoreService);
  private teamStore = inject(TeamStoreService);
  private positionStore = inject(PositionStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  playerId = createNumberParamSignal(this.route, 'playerId');

  sportId = createNumberParamSignal(this.route, 'sportId');

  fromSport = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('fromSport');
      return val === 'true';
    })),
    { initialValue: false }
  );

  fromTournamentId = createNumberParamSignal(this.route, 'tournamentId', { source: 'queryParamMap' });

  fromYear = createNumberParamSignal(this.route, 'year', { source: 'queryParamMap' });

  isInSportContext = computed(() => this.fromSport() === true);
  isInTournamentContext = computed(() => this.fromTournamentId() !== null);

  customMenuItems = computed<CustomMenuItem[]>(() => {
    if (this.isInSportContext()) {
      return [{ id: 'remove-from-sport', label: 'Remove from sport', type: 'danger', icon: '@tui.trash' }];
    }
    return [];
  });

  playerResource = httpResource<PlayerWithPersonAndTournaments | PlayerDetailInTournamentResponse>(() => {
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
    const fromTournamentId = this.fromTournamentId();
    const value = this.playerResource.value();
    
    if (fromTournamentId && value && 'tournament_assignment' in value) {
      return (value as PlayerDetailInTournamentResponse);
    }
    
    return value;
  });

  loading = computed(() => this.playerResource.isLoading() || this.playerCareerResource.isLoading());
  error = computed(() => this.playerResource.error() || this.playerCareerResource.error());

  playerName = computed(() => {
    const player = this.player();
    if (!player) return '';
    
    let firstName: string | null = null;
    let secondName: string | null = null;
    
    if ('person' in player) {
      firstName = player.person?.first_name || null;
      secondName = player.person?.second_name || null;
    } else {
      firstName = (player as any).first_name || null;
      secondName = (player as any).second_name || null;
    }
    
    return (firstName || secondName) ? `${firstName || ''} ${secondName || ''}`.trim() : '';
  });

  playerCareer = computed(() => this.playerCareerResource.value());

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

  tournamentTeams = signal<Team[]>([]);
  tournamentTeamsLoading = signal(false);
  tournamentTeamsError = signal<string | null>(null);

  sportPositions = signal<Position[]>([]);
  sportPositionsLoading = signal(false);
  sportPositionsError = signal<string | null>(null);

  editedTeamId = signal<number | null>(null);
  editedPlayerNumber = signal<string | null>(null);
  editedPositionId = signal<number | null>(null);

  editingTeam = signal(false);
  editingNumber = signal(false);
  editingPosition = signal(false);

  tempTeamId = signal<number | null>(null);
  tempPlayerNumber = signal<string | null>(null);
  tempPositionId = signal<number | null>(null);

  private loadTournamentContext = effect(() => {
    const tournamentId = this.fromTournamentId();
    const sportId = this.sportId();
    if (tournamentId && sportId) {
      this.loadTournamentTeams(tournamentId);
      this.loadSportPositions(sportId);
    }
  });

  private syncTournamentAssignment = effect(() => {
    const assignment = this.tournamentAssignment();
    if (assignment) {
      this.editedTeamId.set(assignment.team_id);
      this.editedPlayerNumber.set(assignment.player_number);
      this.editedPositionId.set(assignment.position_id);
      this.tempTeamId.set(assignment.team_id);
      this.tempPlayerNumber.set(assignment.player_number);
      this.tempPositionId.set(assignment.position_id);
    }
  });

  loadTournamentTeams(tournamentId: number): void {
    this.tournamentTeamsLoading.set(true);
    this.tournamentTeamsError.set(null);

    this.teamStore.getTeamsByTournamentId(tournamentId).pipe(
      tap((teams: Team[]) => {
        this.tournamentTeams.set(teams);
        this.tournamentTeamsLoading.set(false);
      }),
      catchError((_err) => {
        this.tournamentTeamsError.set('Failed to load teams');
        this.tournamentTeamsLoading.set(false);
        this.tournamentTeams.set([]);
        return EMPTY;
      })
    ).subscribe();
  }

  loadSportPositions(sportId: number): void {
    this.sportPositionsLoading.set(true);
    this.sportPositionsError.set(null);

    this.positionStore.getPositionsBySportId(sportId).pipe(
      tap((positions: Position[]) => {
        this.sportPositions.set(positions);
        this.sportPositionsLoading.set(false);
      }),
      catchError((_err) => {
        this.sportPositionsError.set('Failed to load positions');
        this.sportPositionsLoading.set(false);
        this.sportPositions.set([]);
        return EMPTY;
      })
    ).subscribe();
  }

  updateTournamentAssignment(): void {
    const assignmentId = this.tournamentAssignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.playerResource.reload();
      },
      'Tournament assignment'
    );
  }

  startEditTeam(): void {
    this.editingTeam.set(true);
    this.tempTeamId.set(this.editedTeamId());
    this.editingNumber.set(false);
    this.editingPosition.set(false);
  }

  saveTeam(): void {
    const assignmentId = this.tournamentAssignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.playerResource.reload();
        this.editingTeam.set(false);
      },
      'Team'
    );
  }

  cancelEditTeam(): void {
    this.editedTeamId.set(this.tempTeamId());
    this.editingTeam.set(false);
  }

  startEditNumber(): void {
    this.editingNumber.set(true);
    this.tempPlayerNumber.set(this.editedPlayerNumber());
    this.editingTeam.set(false);
    this.editingPosition.set(false);
  }

  saveNumber(): void {
    const assignmentId = this.tournamentAssignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.playerResource.reload();
        this.editingNumber.set(false);
      },
      'Player number'
    );
  }

  cancelEditNumber(): void {
    this.editedPlayerNumber.set(this.tempPlayerNumber());
    this.editingNumber.set(false);
  }

  startEditPosition(): void {
    this.editingPosition.set(true);
    this.tempPositionId.set(this.editedPositionId());
    this.editingTeam.set(false);
    this.editingNumber.set(false);
  }

  savePosition(): void {
    const assignmentId = this.tournamentAssignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.playerResource.reload();
        this.editingPosition.set(false);
      },
      'Position'
    );
  }

  cancelEditPosition(): void {
    this.editedPositionId.set(this.tempPositionId());
    this.editingPosition.set(false);
  }

  stringifyTeam(teamOrId: Team | number | null): string {
    if (teamOrId === null) return 'No team';
    if (typeof teamOrId === 'number') {
      const team = this.tournamentTeams().find(t => t.id === teamOrId);
      return team ? (team.title || `Team #${team.id}`).toUpperCase() : 'Unknown';
    }
    return (teamOrId.title || `Team #${teamOrId.id}`).toUpperCase();
  }

  stringifyPosition(positionOrId: Position | number | null): string {
    if (positionOrId === null) return 'No position';
    if (typeof positionOrId === 'number') {
      const position = this.sportPositions().find(p => p.id === positionOrId);
      return position ? (position.title || `Position #${position.id}`) : 'Unknown';
    }
    return positionOrId.title || `Position #${positionOrId.id}`;
  }

  getTeamName(teamId: number | null): string {
    if (teamId === null) return 'No team';
    const team = this.tournamentTeams().find(t => t.id === teamId);
    return team ? (team.title || `Team #${team.id}`).toUpperCase() : 'Unknown';
  }

  getPositionName(positionId: number | null): string {
    if (positionId === null) return 'No position';
    const position = this.sportPositions().find(p => p.id === positionId);
    return position ? (position.title || `Position #${position.id}`) : 'Unknown';
  }

  careerByTeam = computed(() => {
    const player = this.player();
    const playerCareer = this.playerCareer();
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
    const playerCareer = this.playerCareer();
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

    let personId: number | null = null;

    if ('tournament_assignment' in player) {
      personId = (player as PlayerDetailInTournamentResponse).person?.id || null;
    } else if ('person' in player) {
      personId = player.person?.id || null;
    } else if ('person_eesl_id' in (player as any)) {
      personId = (player as any).person_eesl_id || null;
    }

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

  capitalizeName(name: string | null): string {
    return capitalizeNameUtil(name);
  }

  personPhotoIconUrl(): string | null {
    const player = this.player();
    if (!player) return null;
    const url = ('person' in player) ? player.person?.person_photo_icon_url : (player as any).person_photo_icon_url;
    if (!url) return null;
    return buildStaticUrl(url);
  }

  personPhotoWebUrl(): string | null {
    const player = this.player();
    if (!player) return null;
    const url = ('person' in player) ? player.person?.person_photo_web_url : (player as any).person_photo_web_url;
    if (!url) return null;
    return buildStaticUrl(url);
  }

  getPlayerInitials(): string {
    const player = this.player();
    if (!player) return '';
    
    let firstName: string | null = null;
    let secondName: string | null = null;
    
    if ('person' in player) {
      firstName = player.person?.first_name || null;
      secondName = player.person?.second_name || null;
    } else {
      firstName = (player as any).first_name || null;
      secondName = (player as any).second_name || null;
    }
    
    const capFirstName = this.capitalizeName(firstName);
    const capSecondName = this.capitalizeName(secondName);
    let initials = '';
    if (capFirstName && capFirstName[0]) {
      initials += capFirstName[0].toUpperCase();
    }
    if (capSecondName && capSecondName[0]) {
      initials += capSecondName[0].toUpperCase();
    }
    return initials;
  }
}
