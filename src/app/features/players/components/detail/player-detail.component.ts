import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiAvatar, TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl } from '../../../../core/config/api.constants';
import { PlayerWithPersonAndTournaments, PlayerTeamTournament } from '../../models/player.model';
import { Team as TeamModel } from '../../../teams/models/team.model';
import { Position as PositionModel } from '../../../sports/models/position.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { PlayerStoreService } from '../../services/player-store.service';
import { TeamStoreService } from '../../../teams/services/team-store.service';
import { PositionStoreService } from '../../../sports/services/position-store.service';
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

  playerResource = httpResource<PlayerWithPersonAndTournaments>(() => {
    const playerId = this.playerId();
    if (!playerId) return undefined;
    return buildApiUrl(`/api/players/id/${playerId}/person`);
  });

  player = computed(() => this.playerResource.value());

  loading = computed(() => this.playerResource.isLoading());
  error = computed(() => this.playerResource.error());

  playerName = computed(() => {
    const player = this.player();
    return player ? `${player.first_name || ''} ${player.second_name || ''}`.trim() : '';
  });

  tournamentAssignment = computed(() => {
    const player = this.player();
    const fromTournamentId = this.fromTournamentId();
    if (!player?.player_team_tournaments || !fromTournamentId) return null;
    
    return player.player_team_tournaments.find(ptt => ptt.tournament_id === fromTournamentId);
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

  stringifyTeam(team: TeamModel): string {
    return team.title || `Team #${team.id}`;
  }

  stringifyPosition(position: PositionModel): string {
    return position.title || `Position #${position.id}`;
  }

  careerByTeam = computed(() => {
    const player = this.player();
    if (!player?.player_team_tournaments) return [];

    const teamMap = new Map<number | null, { teamTitle: string; assignments: PlayerTeamTournament[] }>();

    player.player_team_tournaments.forEach(ptt => {
      const teamId = ptt.team_id;
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, {
          teamTitle: ptt.team_title || 'Unknown Team',
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
