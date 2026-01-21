import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiDataList, TuiTextfield, TuiIcon } from '@taiga-ui/core';
import { TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Team, Position } from '../../../../../shared/types';
import { PlayerStoreService } from '../../../services/player-store.service';
import { TeamStoreService } from '../../../../teams/services/team-store.service';
import { PositionStoreService } from '../../../../sports/services/position-store.service';
import { withUpdateAlert } from '../../../../../core/utils/alert-helper.util';

export interface TournamentAssignmentInputs {
  teamId: number | null;
  playerNumber: string | null;
  positionId: number | null;
  teamTitle: string | null;
  positionTitle: string | null;
  tournamentTitle: string | null;
  tournamentId: number;
  sportId: number;
  assignmentId: number | null;
}

export interface TournamentAssignmentOutputs {
  updated: () => void;
}

@Component({
  selector: 'app-tournament-assignment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiDataList,
    TuiTextfield,
    TuiIcon,
    TuiChevron,
    TuiComboBox,
    TuiFilterByInputPipe
  ],
  templateUrl: './tournament-assignment.component.html',
  styleUrl: './tournament-assignment.component.less',
})
export class TournamentAssignmentComponent {
  private alerts = inject(TuiAlertService);
  private playerStore = inject(PlayerStoreService);
  private teamStore = inject(TeamStoreService);
  private positionStore = inject(PositionStoreService);

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

  inputs = signal<TournamentAssignmentInputs | null>(null);
  onUpdated = signal<(() => void) | null>(null);

  tournamentTitle = signal<string | null>(null);

  init(inputs: TournamentAssignmentInputs, onUpdated: () => void): void {
    this.inputs.set(inputs);
    this.onUpdated.set(onUpdated);
    this.tournamentTitle.set(inputs.tournamentTitle);
    
    this.editedTeamId.set(inputs.teamId);
    this.editedPlayerNumber.set(inputs.playerNumber);
    this.editedPositionId.set(inputs.positionId);
    
    this.tempTeamId.set(inputs.teamId);
    this.tempPlayerNumber.set(inputs.playerNumber);
    this.tempPositionId.set(inputs.positionId);

    this.loadTournamentTeams(inputs.tournamentId);
    this.loadSportPositions(inputs.sportId);
  }

  private loadTournamentTeams(tournamentId: number): void {
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

  private loadSportPositions(sportId: number): void {
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

  startEditTeam(): void {
    this.editingTeam.set(true);
    this.tempTeamId.set(this.editedTeamId());
    this.editingNumber.set(false);
    this.editingPosition.set(false);
  }

  saveTeam(): void {
    const assignmentId = this.assignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.onUpdated()?.();
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
    const assignmentId = this.assignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.onUpdated()?.();
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
    const assignmentId = this.assignmentId();
    if (!assignmentId) return;

    withUpdateAlert(
      this.alerts,
      () => this.playerStore.updatePlayerTeamTournament(assignmentId, {
        team_id: this.editedTeamId(),
        player_number: this.editedPlayerNumber(),
        position_id: this.editedPositionId()
      }),
      () => {
        this.onUpdated()?.();
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

  private assignmentId(): number | null {
    return this.inputs()?.assignmentId || null;
  }
}
