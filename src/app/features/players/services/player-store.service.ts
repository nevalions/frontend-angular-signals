import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Player, PlayerAddToSport, PlayersPaginatedResponse, PlayerTeamTournament, PlayerTeamTournamentWithDetails, PlayerTeamTournamentWithDetailsPaginatedResponse, RemovePersonFromSportResponse, PaginatedPlayerWithDetailsResponse } from '../models/player.model';
import { Person } from '../../persons/models/person.model';
import { SortOrder } from '../../../core/models';

interface PlayersResourceParams {
  sportId: number | null;
  teamId: number | null;
  page: number;
  itemsPerPage: number;
  sortOrder: SortOrder;
  search: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  sportId = signal<number | null>(null);
  teamId = signal<number | null>(null);
  page = signal<number>(1);
  itemsPerPage = signal<number>(10);
  sortOrder = signal<SortOrder>('asc');
  search = signal<string>('');

  playersResource = rxResource<PlayersPaginatedResponse, PlayersResourceParams>({
    params: computed(() => ({
      sportId: this.sportId(),
      teamId: this.teamId(),
      page: this.page(),
      itemsPerPage: this.itemsPerPage(),
      sortOrder: this.sortOrder(),
      search: this.search(),
    })),
    stream: ({ params }: { params: PlayersResourceParams }) => {
      if (!params.sportId) {
        return new Observable<PlayersPaginatedResponse>(observer => {
          observer.next({ data: [], metadata: { page: 1, items_per_page: 10, total_items: 0, total_pages: 0, has_next: false, has_previous: false } });
          observer.complete();
        });
      }

      let httpParams = new HttpParams()
        .set('sport_id', params.sportId.toString())
        .set('page', params.page.toString())
        .set('items_per_page', params.itemsPerPage.toString())
        .set('ascending', (params.sortOrder === 'asc').toString());

      if (params.teamId) {
        httpParams = httpParams.set('team_id', params.teamId.toString());
      }

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }

      return this.http.get<PlayersPaginatedResponse>(buildApiUrl('/api/players/paginated/details'), { params: httpParams });
    },
    injector: this.injector,
  });

  players = computed(() => this.playersResource.value()?.data ?? []);
  loading = computed(() => this.playersResource.isLoading());
  error = computed(() => this.playersResource.error());

  totalCount = computed(() => this.playersResource.value()?.metadata.total_items ?? 0);
  totalPages = computed(() => this.playersResource.value()?.metadata.total_pages ?? 0);

  setSportId(sportId: number): void {
    this.sportId.set(sportId);
    this.page.set(1);
  }

  setTeamId(teamId: number | null): void {
    this.teamId.set(teamId);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  setItemsPerPage(size: number): void {
    this.itemsPerPage.set(size);
    this.page.set(1);
  }

  setSort(sortOrder: SortOrder): void {
    this.sortOrder.set(sortOrder);
    this.page.set(1);
  }

  setSearch(query: string): void {
    this.search.set(query);
    this.page.set(1);
  }

  reload(): void {
    this.playersResource.reload();
  }

  getPlayerByPersonId(personId: number): Observable<Player> {
    return this.apiService.get<Player>(`/api/players/person/id/${personId}`);
  }

  getPlayerWithPerson(playerId: number): Observable<Player> {
    return this.apiService.get<Player>(`/api/players/id/${playerId}/person`);
  }

  createPlayer(playerData: { sport_id: number | null; person_id: number | null; player_eesl_id: number | null }): Observable<Player> {
    return this.apiService.post<Player>('/api/players/', playerData);
  }

  getAvailablePersonsForSport(sportId: number): Observable<Person[]> {
    return this.http.get<Person[]>(buildApiUrl(`/api/persons/not-in-sport/${sportId}/all`));
  }

  getPlayersByTournamentId(tournamentId: number): Observable<PlayerTeamTournamentWithDetails[]> {
    return this.http.get<PlayerTeamTournamentWithDetails[]>(buildApiUrl(`/api/tournaments/id/${tournamentId}/players/`));
  }

  getTournamentPlayersPaginated(
    tournamentId: number,
    page: number,
    itemsPerPage: number,
    ascending: boolean = true,
    search: string = ''
  ): Observable<PlayerTeamTournamentWithDetailsPaginatedResponse> {
    let httpParams = new HttpParams()
      .set('tournament_id', tournamentId.toString())
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString())
      .set('ascending', ascending.toString());

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    return this.http.get<PlayerTeamTournamentWithDetailsPaginatedResponse>(
      buildApiUrl(`/api/players_team_tournament/tournament/${tournamentId}/players/paginated/details`),
      { params: httpParams }
    );
  }

  getAvailablePlayersForTournament(tournamentId: number): Observable<Player[]> {
    return this.http.get<Player[]>(buildApiUrl(`/api/tournaments/id/${tournamentId}/players/available`));
  }

  getTournamentPlayersPaginatedV2(
    tournamentId: number,
    page: number,
    itemsPerPage: number,
    ascending: boolean = true,
    search: string = '',
    orderBy: string = 'second_name',
    orderByTwo: string = 'id'
  ): Observable<PaginatedPlayerWithDetailsResponse> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString())
      .set('ascending', ascending.toString())
      .set('order_by', orderBy)
      .set('order_by_two', orderByTwo);

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    return this.http.get<PaginatedPlayerWithDetailsResponse>(
      buildApiUrl(`/api/tournaments/id/${tournamentId}/players/paginated`),
      { params: httpParams }
    );
  }

  getTournamentPlayersWithoutTeam(tournamentId: number): Observable<Player[]> {
    return this.http.get<Player[]>(buildApiUrl(`/api/tournaments/id/${tournamentId}/players/without-team/all`));
  }

  addPlayerToTournament(tournamentId: number, playerId: number): Observable<PlayerTeamTournament> {
    return this.apiService.post<PlayerTeamTournament>('/api/players_team_tournament/', {
      player_id: playerId,
      tournament_id: tournamentId
    });
  }

  addPersonToSport(data: PlayerAddToSport): Observable<Player> {
    return this.http.post<Player>(buildApiUrl('/api/players/add-person-to-sport'), data).pipe(
      tap(() => this.playersResource.reload())
    );
  }

  removePersonFromSport(personId: number, sportId: number): Observable<RemovePersonFromSportResponse> {
    return this.http.delete<RemovePersonFromSportResponse>(
      buildApiUrl(`/api/players/remove-person-from-sport/personid/${personId}/sportid/${sportId}`)
    ).pipe(
      tap(() => this.playersResource.reload())
    );
  }
}
