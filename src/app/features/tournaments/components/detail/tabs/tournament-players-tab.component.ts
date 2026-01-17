import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TuiAlertService, TuiButton, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiButtonClose, TuiPagination } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PlayerStoreService } from '../../../../players/services/player-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { PlayerTeamTournamentWithDetails, PlayerTeamTournamentWithDetailsAndPhotos, PlayerWithPerson } from '../../../../players/models/player.model';
import { capitalizeName as capitalizeNameUtil } from '../../../../../core/utils/string-helper.util';
import { buildStaticUrl } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-tournament-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    TuiTextfield,
    TuiButton,
    TuiButtonClose,
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
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  tournamentId = input.required<number>();
  sportId = input.required<number>();
  year = input.required<number | null>();

  playersLoading = signal(false);
  playersError = signal<string | null>(null);
  playersCurrentPage = signal(1);
  playersItemsPerPage = signal(20);
  playersTotalCount = signal(0);
  playersTotalPages = signal(0);

  players = signal<PlayerTeamTournamentWithDetailsAndPhotos[]>([]);
  playersSearch = signal('');

  playersSortOrder = signal<'asc' | 'desc'>('asc');

  addPlayerDialogOpen = signal(false);
  availablePlayers = signal<PlayerWithPerson[]>([]);
  availablePlayersLoading = signal(false);
  availablePlayersError = signal<string | null>(null);
  availablePlayersSearch = signal('');
  selectedPlayerId = signal<number | null>(null);

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

    this.playerStore.getTournamentPlayersPaginatedWithPhotos(
      tournamentId,
      this.playersCurrentPage(),
      this.playersItemsPerPage(),
      this.playersSortOrder() === 'asc',
      this.playersSearch()
    ).subscribe({
      next: (response) => {
        this.players.set(response.data || []);
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

  capitalizeName(name: string | null): string {
    return capitalizeNameUtil(name);
  }

  playerPhotoIconUrl(player: PlayerTeamTournamentWithDetailsAndPhotos): string | null {
    return player.person_photo_icon_url ? buildStaticUrl(player.person_photo_icon_url) : null;
  }

  openAddPlayerDialog(): void {
    this.availablePlayersSearch.set('');
    this.selectedPlayerId.set(null);
    this.addPlayerDialogOpen.set(true);
    this.loadAvailablePlayers();
  }

  closeAddPlayerDialog(): void {
    this.addPlayerDialogOpen.set(false);
    this.availablePlayers.set([]);
    this.selectedPlayerId.set(null);
  }

  loadAvailablePlayers(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.availablePlayersLoading.set(true);
    this.availablePlayersError.set(null);

    this.playerStore.getAvailablePlayersForTournament(tournamentId).pipe(
      tap((players) => {
        this.availablePlayers.set(players);
        this.availablePlayersLoading.set(false);
      }),
      catchError(() => {
        this.availablePlayersError.set('Failed to load available players');
        this.availablePlayersLoading.set(false);
        return EMPTY;
      })
    ).subscribe();
  }

  onAvailablePlayersSearchChange(query: string): void {
    this.availablePlayersSearch.set(query);
  }

  clearAvailablePlayersSearch(): void {
    this.availablePlayersSearch.set('');
  }

  filteredAvailablePlayers(): PlayerWithPerson[] {
    const query = this.availablePlayersSearch().toLowerCase();
    if (!query) return this.availablePlayers();
    return this.availablePlayers().filter(p => {
      const firstName = p.person?.first_name || '';
      const secondName = p.person?.second_name || '';
      const fullName = `${firstName} ${secondName}`.toLowerCase();
      return fullName.includes(query);
    });
  }

  addPlayerToTournament(): void {
    const tournamentId = this.tournamentId();
    const playerId = this.selectedPlayerId();

    if (!tournamentId || !playerId) return;

    this.playerStore.addPlayerToTournament(tournamentId, playerId).pipe(
      tap(() => {
        this.alerts.open('Player added to tournament successfully', {
          label: 'Success',
          appearance: 'positive',
          autoClose: 3000
        }).subscribe();
        this.closeAddPlayerDialog();
        this.loadPlayers();
      }),
      catchError((err) => {
        this.alerts.open(`Failed to add player: ${err.message || 'Unknown error'}`, {
          label: 'Error',
          appearance: 'negative'
        }).subscribe();
        return EMPTY;
      })
    ).subscribe();
  }

  selectPlayer(playerId: number): void {
    this.selectedPlayerId.set(playerId);
  }

  availablePlayerFullName(player: PlayerWithPerson): string {
    const firstName = player.person?.first_name || '';
    const secondName = player.person?.second_name || '';
    return `${firstName} ${secondName}`.trim();
  }

  capitalizeAvailablePlayerName(name: string | null): string {
    return capitalizeNameUtil(name);
  }

  availablePlayerPhotoIconUrl(player: PlayerWithPerson): string | null {
    const url = player.person?.person_photo_icon_url;
    return url ? buildStaticUrl(url) : null;
  }
}
