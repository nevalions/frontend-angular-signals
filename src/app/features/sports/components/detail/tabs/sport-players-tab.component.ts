import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TuiTextfield, TuiButton } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiPagination } from '@taiga-ui/kit';
import { PlayerStoreService } from '../../../../players/services/player-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';

@Component({
  selector: 'app-sport-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiAvatar,
    TuiPagination
  ],
  templateUrl: './sport-players-tab.component.html',
  styleUrl: './sport-players-tab.component.less',
})
export class SportPlayersTabComponent {
  private playerStore = inject(PlayerStoreService);
  private navigationHelper = inject(NavigationHelperService);

  sportId = input.required<number>();

  playersLoading = computed(() => this.playerStore.loading());
  playersError = computed(() => this.playerStore.error());
  playersCurrentPage = signal(1);
  playersItemsPerPage = signal(10);
  playersTotalCount = computed(() => this.playerStore.totalCount());
  playersTotalPages = computed(() => this.playerStore.totalPages());

  players = computed(() => this.playerStore.players());
  playersSearch = computed(() => this.playerStore.search());

  playersSortOrder = signal<'asc' | 'desc'>('asc');

  readonly itemsPerPageOptions = [10, 20, 50];

  onPlayersSearchChange(query: string): void {
    this.playerStore.setSearch(query);
  }

  clearPlayersSearch(): void {
    this.playerStore.setSearch('');
  }

  onPlayersPageChange(pageIndex: number): void {
    this.playersCurrentPage.set(pageIndex + 1);
    this.playerStore.setPage(pageIndex + 1);
  }

  onPlayersItemsPerPageChange(itemsPerPage: number): void {
    this.playersItemsPerPage.set(itemsPerPage);
    this.playerStore.setItemsPerPage(itemsPerPage);
    this.playersCurrentPage.set(1);
  }

  togglePlayersSort(): void {
    this.playersSortOrder.set(this.playersSortOrder() === 'asc' ? 'desc' : 'asc');
    this.playerStore.setSort(this.playersSortOrder());
  }

  capitalizeName(name: string | null): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  navigateToAddPlayer(): void {
    this.navigationHelper.toPersonCreate();
  }
}
