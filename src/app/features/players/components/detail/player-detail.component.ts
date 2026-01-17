import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiDataList, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiAvatar, TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl, buildStaticUrl } from '../../../../core/config/api.constants';
import { PlayerWithPersonAndTournaments, PlayerTeamTournament, PlayerCareer, CareerByTournament, CareerByTeam, PlayerDetailInTournamentResponse } from '../../models/player.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { PlayerStoreService } from '../../services/player-store.service';
import { withDeleteConfirm, withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { capitalizeName as capitalizeNameUtil } from '../../../../core/utils/string-helper.util';

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

  playerId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('playerId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  sportId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('sportId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  fromSport = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('fromSport');
      return val === 'true';
    })),
    { initialValue: false }
  );

  fromTournamentId = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('tournamentId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  fromYear = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

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
    
    if (fromTournamentId && 'tournament_assignment' in this.playerResource.value()) {
      return (this.playerResource.value() as PlayerDetailInTournamentResponse);
    }
    
    return this.playerResource.value();
  });

  loading = computed(() => this.playerResource.isLoading() || this.playerCareerResource.isLoading());
  error = computed(() => this.playerResource.error() || this.playerCareerResource.error());

  playerName = computed(() => {
    const player = this.player();
    const firstName = player?.first_name ?? player?.person?.first_name ?? null;
    const secondName = player?.second_name ?? player?.person?.second_name ?? null;
    return (firstName || secondName) ? `${firstName || ''} ${secondName || ''}`.trim() : '';
  });

  playerCareer = computed(() => this.playerCareerResource.value());

  tournamentAssignment = computed(() => {
    const player = this.player();
    const fromTournamentId = this.fromTournamentId();
    
    if (fromTournamentId && 'tournament_assignment' in player) {
      return player.tournament_assignment;
    }
    
    return null;
  });

  tournamentTeams = signal<TeamModel[]>([]);
  tournamentTeamsLoading = signal(false);
  tournamentTeamsError = signal<string | null>(null);

  sportPositions = signal<PositionModel[]>([]);
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
      tap((teams: TeamModel[]) => {
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
      tap((positions: PositionModel[]) => {
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
    const assignment = this.tournamentAssignment();
    if (!assignment) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignment.id, {
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
    const assignment = this.tournamentAssignment();
    if (!assignment) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignment.id, {
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
    const assignment = this.tournamentAssignment();
    if (!assignment) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignment.id, {
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
    const assignment = this.tournamentAssignment();
    if (!assignment) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignment.id, {
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

  stringifyTeam(teamOrId: TeamModel | number | null): string {
    if (teamOrId === null) return 'No team';
    if (typeof teamOrId === 'number') {
      const team = this.tournamentTeams().find(t => t.id === teamOrId);
      return team ? (team.title || `Team #${team.id}`).toUpperCase() : 'Unknown';
    }
    return (teamOrId.title || `Team #${teamOrId.id}`).toUpperCase();
  }

  stringifyPosition(positionOrId: PositionModel | number | null): string {
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
    if (!player?.player_team_tournaments) return [];

    const teamMap = new Map<number | null, { teamTitle: string; assignments: PlayerTeamTournament[] }>();

    player.player_team_tournaments.forEach(ptt => {
      const teamId = ptt.team_id;
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, {
          teamTitle: (ptt.team_title || 'Unknown Team').toUpperCase(),
          assignments: []
        });
      }
      teamMap.get(teamId)!.assignments.push(ptt);
    });

    return Array.from(teamMap.values());
  });

  careerByTournament = computed(() => {
    const player = this.player();
    if (!player?.player_team_tournaments) return [];

    const tournamentMap = new Map<number | null, { tournamentId: number | null; assignments: PlayerTeamTournament[] }>();

    player.player_team_tournaments.forEach(ptt => {
      const tournamentId = ptt.tournament_id;
      if (!tournamentMap.has(tournamentId)) {
        tournamentMap.set(tournamentId, {
          tournamentId: tournamentId,
          assignments: []
        });
      }
      tournamentMap.get(tournamentId)!.assignments.push(ptt);
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
    if (!player?.person_photo_icon_url) return null;
    return buildStaticUrl(player.person_photo_icon_url);
  }

  personPhotoWebUrl(): string | null {
    const player = this.player();
    if (!player?.person_photo_web_url) return null;
    return buildStaticUrl(player.person_photo_web_url);
  }

  getPlayerInitials(): string {
    const player = this.player();
    if (!player) return '';
    const firstName = this.capitalizeName(player.first_name ?? player.person?.first_name ?? null);
    const secondName = this.capitalizeName(player.second_name ?? player.person?.second_name ?? null);
    let initials = '';
    if (firstName && firstName[0]) {
      initials += firstName[0].toUpperCase();
    }
    if (secondName && secondName[0]) {
      initials += secondName[0].toUpperCase();
    }
    return initials;
  }
}
