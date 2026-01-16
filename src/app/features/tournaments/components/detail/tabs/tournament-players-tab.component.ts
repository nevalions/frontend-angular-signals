import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { TuiTextfield, TuiButton, TuiAlertService, TuiDataList } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiChevron, TuiComboBox, TuiFilterByInputPipe, TuiPagination } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PlayerStoreService } from '../../../../players/services/player-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { PlayerTeamTournamentWithDetails, PlayerWithPerson } from '../../../../players/models/player.model';
import { capitalizeName as capitalizeNameUtil } from '../../../../../core/utils/string-helper.util';
import { withCreateAlert } from '../../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-tournament-players-tab',
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
    TuiAvatar,
    TuiPagination
  ],
  templateUrl: './tournament-players-tab.component.html',
  styleUrl: './tournament-players-tab.component.less',
})
export class TournamentPlayersTabComponent {
  private playerStore = inject(PlayerStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private alerts = inject(TuiAlertService);

  tournamentId = input.required<number>();
  sportId = input.required<number>();
  year = input.required<number | null>();

  playersLoading = signal(false);
  playersError = signal<string | null>(null);
  playersCurrentPage = signal(1);
  playersItemsPerPage = signal(20);
  playersTotalCount = signal(0);
  playersTotalPages = signal(0);

  players = signal<PlayerTeamTournamentWithDetails[]>([]);
  playersSearch = signal('');

  playersSortOrder = signal<'asc' | 'desc'>('asc');

  availablePlayers = signal<PlayerWithPerson[]>([]);
  availablePlayersLoading = signal(false);
  availablePlayersError = signal<string | null>(null);

  playersWithoutTeam = signal<PlayerWithPerson[]>([]);
  playersWithoutTeamLoading = signal(false);
  playersWithoutTeamError = signal<string | null>(null);

  showAddPlayerForm = signal(false);
  selectedPlayer = signal<PlayerWithPerson | null>(null);

  readonly itemsPerPageOptions = [10, 20, 50];

  private loadPlayersOnTournamentChange = effect(() => {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.loadPlayers();
    }
  });

  loadPlayers(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.playersLoading.set(true);
    this.playersError.set(null);

    this.playerStore.getTournamentPlayersPaginatedV2(
      tournamentId,
      this.playersCurrentPage(),
      this.playersItemsPerPage(),
      this.playersSortOrder() === 'asc',
      this.playersSearch()
    ).subscribe({
      next: (response) => {
        const playersWithTeamInfo: PlayerTeamTournamentWithDetails[] = (response.data || []).map(player => {
          const teamTournament = player.player_team_tournaments?.find(ptt => ptt.tournament_id === tournamentId);
          return {
            id: player.id,
            player_team_tournament_eesl_id: teamTournament?.player_team_tournament_eesl_id || null,
            player_id: player.id,
            player_number: teamTournament?.player_number || null,
            team_id: teamTournament?.team_id || null,
            team_title: teamTournament?.team_title || null,
            position_id: teamTournament?.position_id || null,
            position_title: teamTournament?.position_title || null,
            tournament_id: tournamentId,
            first_name: player.first_name,
            second_name: player.second_name
          };
        });
        this.players.set(playersWithTeamInfo);
        this.playersTotalCount.set(response.metadata?.total_items || 0);
        this.playersTotalPages.set(response.metadata?.total_pages || 0);
        this.playersLoading.set(false);
      },
      error: () => {
        this.playersError.set('Failed to load players');
        this.playersLoading.set(false);
      }
    });
  }

  onPlayersSearchChange(query: string): void {
    this.playersSearch.set(query);
    this.playersCurrentPage.set(1);
  }

  clearPlayersSearch(): void {
    this.playersSearch.set('');
    this.playersCurrentPage.set(1);
  }

  onPlayersPageChange(pageIndex: number): void {
    this.playersCurrentPage.set(pageIndex + 1);
    this.loadPlayers();
  }

  onPlayersItemsPerPageChange(itemsPerPage: number): void {
    this.playersItemsPerPage.set(itemsPerPage);
    this.playersCurrentPage.set(1);
    this.loadPlayers();
  }

  togglePlayersSort(): void {
    this.playersSortOrder.set(this.playersSortOrder() === 'asc' ? 'desc' : 'asc');
    this.playersCurrentPage.set(1);
    this.loadPlayers();
  }

  navigateToPlayerDetail(playerId: number): void {
    const sportId = this.sportId();
    const year = this.year();
    const tournamentId = this.tournamentId();
    if (sportId && year && tournamentId) {
      this.navigationHelper.toPlayerDetailFromTournament(sportId, year, tournamentId, playerId);
    }
  }

  toggleAddPlayerForm(): void {
    if (!this.showAddPlayerForm()) {
      this.loadPlayersWithoutTeam();
    }
    this.showAddPlayerForm.update(v => !v);
  }

  loadAvailablePlayers(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.availablePlayersLoading.set(true);
    this.availablePlayersError.set(null);

    this.playerStore.getAvailablePlayersForTournament(tournamentId).pipe(
      tap((players: PlayerWithPerson[]) => {
        const sortedPlayers = Array.isArray(players)
          ? [...players].sort((a, b) => {
              const nameA = `${a.person?.second_name || ''} ${a.person?.first_name || ''}`.toLowerCase();
              const nameB = `${b.person?.second_name || ''} ${b.person?.first_name || ''}`.toLowerCase();
              return nameA.localeCompare(nameB);
            })
          : [];
        this.availablePlayers.set(sortedPlayers);
        this.availablePlayersLoading.set(false);
      }),
      catchError((_err) => {
        this.availablePlayersError.set('Failed to load available players');
        this.availablePlayersLoading.set(false);
        this.availablePlayers.set([]);
        return EMPTY;
      })
    ).subscribe();
  }

  loadPlayersWithoutTeam(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.playersWithoutTeamLoading.set(true);
    this.playersWithoutTeamError.set(null);

    this.playerStore.getAvailablePlayersForTournament(tournamentId).pipe(
      tap((players: PlayerWithPerson[]) => {
        const sortedPlayers = Array.isArray(players)
          ? [...players].sort((a, b) => {
              const nameA = `${a.person?.second_name || ''} ${a.person?.first_name || ''}`.toLowerCase();
              const nameB = `${b.person?.second_name || ''} ${b.person?.first_name || ''}`.toLowerCase();
              return nameA.localeCompare(nameB);
            })
          : [];
        this.playersWithoutTeam.set(sortedPlayers);
        this.playersWithoutTeamLoading.set(false);
      }),
      catchError((_err) => {
        this.playersWithoutTeamError.set('Failed to load available players');
        this.playersWithoutTeamLoading.set(false);
        this.playersWithoutTeam.set([]);
        return EMPTY;
      })
    ).subscribe();
  }

  addPlayer(): void {
    const tournamentId = this.tournamentId();
    const player = this.selectedPlayer();
    if (!tournamentId || !player) return;

    withCreateAlert(
      this.alerts,
      () => this.playerStore.addPlayerToTournament(tournamentId, player.id),
      () => this.onAddPlayerSuccess(),
      'Player'
    );
  }

  onAddPlayerSuccess(): void {
    this.loadPlayers();
    this.showAddPlayerForm.set(false);
    this.selectedPlayer.set(null);
  }

  cancelAddPlayer(): void {
    this.showAddPlayerForm.set(false);
    this.selectedPlayer.set(null);
  }

  capitalizeName(name: string | null): string {
    return capitalizeNameUtil(name);
  }

  stringifyPlayer(player: PlayerWithPerson): string {
    const firstName = capitalizeNameUtil(player.person?.first_name)?.trim() || '';
    const secondName = capitalizeNameUtil(player.person?.second_name)?.trim() || '';

    if (firstName || secondName) {
      const name = `${secondName} ${firstName}`.trim();
      return name || `Player #${player.id}`;
    }

    return `Player #${player.id}`;
  }
}
