import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDataList, TuiDialogContext, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiSelect, TUI_CONFIRM } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Position } from '../../../../../shared/types';
import { PositionStoreService } from '../../../../sports/services/position-store.service';
import { MatchStoreService } from '../../../services/match-store.service';
import { PlayerMatchUpdate } from '../../../models/player-match.model';
import { PlayerMatchWithDetails } from '../../../models/comprehensive-match.model';
import { withDeleteConfirm, withUpdateAlert } from '../../../../../core/utils/alert-helper.util';

export interface MatchPlayerEditDialogData {
  player: PlayerMatchWithDetails;
  teamPlayers: PlayerMatchWithDetails[];
  sportId: number;
}

export interface MatchPlayerEditDialogResult {
  updated?: boolean;
  deleted?: boolean;
}

@Component({
  selector: 'app-match-player-edit-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TuiButton, TuiTextfield, TuiSelect, TuiDataList, TuiChevron],
  templateUrl: './match-player-edit-dialog.component.html',
  styleUrl: './match-player-edit-dialog.component.less',
})
export class MatchPlayerEditDialogComponent {
  private readonly context = inject<TuiDialogContext<MatchPlayerEditDialogResult, MatchPlayerEditDialogData>>(POLYMORPHEUS_CONTEXT);
  private readonly matchStore = inject(MatchStoreService);
  private readonly positionStore = inject(PositionStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  player = signal<PlayerMatchWithDetails>(this.context.data.player);
  playerNumber = signal<string>('');
  selectedPositionId = signal<number | null>(null);
  teamPlayers = signal<PlayerMatchWithDetails[]>(this.context.data.teamPlayers || []);

  positions = signal<Position[]>([]);
  positionsLoading = signal(false);
  positionsError = signal<string | null>(null);

  constructor() {
    const currentPlayer = this.player();
    this.playerNumber.set(currentPlayer.match_number || currentPlayer.player_team_tournament?.player_number || '');
    this.selectedPositionId.set(currentPlayer.match_position_id ?? currentPlayer.position?.id ?? null);
    this.loadPositions();
  }

  stringifyPositionId = (id: number | null): string => {
    if (id === null) return 'No position';
    const position = this.positions().find(p => p.id === id);
    return position ? position.title : 'Unknown position';
  };

  close(): void {
    this.context.completeWith({});
  }

  save(): void {
    if (this.isDuplicateNumber()) {
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Duplicate number',
          size: 's',
          data: {
            content: 'Another player already has this number. Save anyway?',
            yes: 'Save',
            no: 'Cancel',
            appearance: 'warning',
          },
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.updatePlayer();
          }
        });
      return;
    }

    this.updatePlayer();
  }

  delete(): void {
    const player = this.player();
    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Remove ${player.person?.first_name || ''} ${player.person?.second_name || ''} from match?`,
        content: 'This action cannot be undone!',
      },
      () => this.matchStore.deletePlayerMatch(player.id),
      () => this.context.completeWith({ deleted: true }),
      'Match player'
    );
  }

  private loadPositions(): void {
    const sportId = this.context.data.sportId;
    this.positionsLoading.set(true);
    this.positionsError.set(null);

    this.positionStore.getPositionsBySportId(sportId).pipe(
      tap((positions: Position[]) => {
        const sortedPositions = [...positions].sort((a, b) => a.title.localeCompare(b.title));
        this.positions.set(sortedPositions);
        this.positionsLoading.set(false);
      }),
      catchError(() => {
        this.positionsError.set('Failed to load positions');
        this.positions.set([]);
        this.positionsLoading.set(false);
        return EMPTY;
      })
    ).subscribe();
  }

  private updatePlayer(): void {
    const player = this.player();
    const data: PlayerMatchUpdate = {
      match_number: this.playerNumber() || null,
      match_position_id: this.selectedPositionId(),
    };

    withUpdateAlert(
      this.alerts,
      () => this.matchStore.updatePlayerMatch(player.id, data),
      () => this.context.completeWith({ updated: true }),
      'Match player'
    );
  }

  private isDuplicateNumber(): boolean {
    const number = (this.playerNumber() || '').trim();
    if (!number) return false;
    return this.teamPlayers().some(player =>
      player.id !== this.player().id && this.getPlayerNumberValue(player) === number
    );
  }

  private getPlayerNumberValue(player: PlayerMatchWithDetails): string {
    return (player.match_number || player.player_team_tournament?.player_number || '').trim();
  }
}
