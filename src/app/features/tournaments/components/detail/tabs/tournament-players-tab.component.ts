import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiPagination } from '@taiga-ui/kit';
import { PlayerStoreService } from '../../../../players/services/player-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { PlayerTeamTournamentWithDetails, PlayerTeamTournamentWithDetailsAndPhotos } from '../../../../players/models/player.model';
import { capitalizeName as capitalizeNameUtil } from '../../../../../core/utils/string-helper.util';
import { buildStaticUrl } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-tournament-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    TuiTextfield,
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
}
