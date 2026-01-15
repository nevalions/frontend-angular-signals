import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield, TuiButton, TuiAlertService, TuiDataList } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiPagination, TuiChevron, TuiComboBox, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PlayerStoreService } from '../../../../players/services/player-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { Person } from '../../../../persons/models/person.model';
import { capitalizeName as capitalizeNameUtil } from '../../../../../core/utils/string-helper.util';
import { withCreateAlert } from '../../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-sport-players-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
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
  templateUrl: './sport-players-tab.component.html',
  styleUrl: './sport-players-tab.component.less',
})
export class SportPlayersTabComponent {
  private playerStore = inject(PlayerStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private alerts = inject(TuiAlertService);

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

  availablePersons = signal<Person[]>([]);
  availablePersonsLoading = signal(false);
  availablePersonsError = signal<string | null>(null);
  showAddPlayerForm = signal(false);
  selectedPerson = signal<Person | null>(null);

  capitalizeName(name: string | null): string {
    return capitalizeNameUtil(name);
  }

  stringifyPerson(person: Person): string {
    return `${capitalizeNameUtil(person.second_name)} ${capitalizeNameUtil(person.first_name)}`;
  }

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

  toggleAddPlayerForm(): void {
    if (!this.showAddPlayerForm()) {
      this.loadAvailablePersons();
    }
    this.showAddPlayerForm.update(v => !v);
  }

  loadAvailablePersons(): void {
    const sportId = this.sportId();
    if (!sportId) return;

    this.availablePersonsLoading.set(true);
    this.availablePersonsError.set(null);

    this.playerStore.getAvailablePersonsForSport(sportId).pipe(
      tap((persons: Person[]) => {
        const sortedPersons = Array.isArray(persons)
          ? [...persons].sort((a, b) => a.second_name.localeCompare(b.second_name))
          : [];
        this.availablePersons.set(sortedPersons);
        this.availablePersonsLoading.set(false);
      }),
      catchError((_err) => {
        this.availablePersonsError.set('Failed to load available persons');
        this.availablePersonsLoading.set(false);
        this.availablePersons.set([]);
        return EMPTY;
      })
    ).subscribe();
  }

  addPlayer(): void {
    const sportId = this.sportId();
    const person = this.selectedPerson();
    if (!sportId || !person) return;

    withCreateAlert(
      this.alerts,
      () => this.playerStore.createPlayer({
        sport_id: sportId,
        person_id: person.id,
        player_eesl_id: null
      }),
      () => this.onAddPlayerSuccess(),
      'Player'
    );
  }

  onAddPlayerSuccess(): void {
    this.playerStore.reload();
    this.showAddPlayerForm.set(false);
    this.selectedPerson.set(null);
  }

  cancelAddPlayer(): void {
    this.showAddPlayerForm.set(false);
    this.selectedPerson.set(null);
  }

  navigateToPlayerDetail(playerId: number): void {
    this.navigationHelper.toPlayerDetailFromSport(this.sportId(), playerId);
  }
}
