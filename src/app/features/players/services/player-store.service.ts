import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Player, PlayerAddToSport, PlayerTeamTournament, PlayerTeamTournamentWithDetails, PlayerTeamTournamentWithDetailsPaginatedResponse, RemovePersonFromSportResponse, PaginatedPlayerWithDetailsAndPhotosResponse, PlayerWithPerson, PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse, PlayerCareer } from '../models/player.model';
import { Person } from '../../persons/models/person.model';
import { SortOrder } from '../../../core/models';
import { buildPaginationParams, createPaginationState } from '../../../core/utils/pagination-helper.util';

interface PlayersResourceParams {
  sportId: number | null;
  teamId: number | null;
  page: number;
  itemsPerPage: number;
  sortOrder: SortOrder;
  search: string;
}

interface TournamentPlayersPaginatedOptions {
  page: number;
  itemsPerPage: number;
  ascending?: boolean;
  search?: string;
  orderBy?: string;
  orderByTwo?: string;
  includePhotos?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);
  private pagination = createPaginationState();

  sportId = signal<number | null>(null);
  teamId = signal<number | null>(null);
  page = this.pagination.page;
  itemsPerPage = this.pagination.itemsPerPage;
  sortOrder = this.pagination.sortOrder;
  search = this.pagination.search;

  playersResource = rxResource<PaginatedPlayerWithDetailsAndPhotosResponse, PlayersResourceParams>({
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
        return new Observable<PaginatedPlayerWithDetailsAndPhotosResponse>(observer => {
          observer.next({ data: [], metadata: { page: 1, items_per_page: 10, total_items: 0, total_pages: 0, has_next: false, has_previous: false } });
          observer.complete();
        });
      }

      let httpParams = buildPaginationParams({
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        sortOrder: params.sortOrder,
        search: params.search,
      }).set('sport_id', params.sportId.toString());

      if (params.teamId) {
        httpParams = httpParams.set('team_id', params.teamId.toString());
      }

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }

      return this.http.get<PaginatedPlayerWithDetailsAndPhotosResponse>(buildApiUrl('/api/players/paginated/details-with-photos'), { params: httpParams });
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
    this.pagination.setPage(page);
  }

  setItemsPerPage(size: number): void {
    this.pagination.setItemsPerPage(size);
  }

  setSort(sortOrder: SortOrder): void {
    this.pagination.setSortOrder(sortOrder);
  }

  setSearch(query: string): void {
    this.pagination.setSearch(query);
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
    options: TournamentPlayersPaginatedOptions & { includePhotos: true }
  ): Observable<PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse>;
  getTournamentPlayersPaginated(
    tournamentId: number,
    options: TournamentPlayersPaginatedOptions & { includePhotos?: false }
  ): Observable<PlayerTeamTournamentWithDetailsPaginatedResponse>;
  getTournamentPlayersPaginated(
    tournamentId: number,
    options: TournamentPlayersPaginatedOptions
  ): Observable<PlayerTeamTournamentWithDetailsPaginatedResponse | PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse> {
    const {
      page,
      itemsPerPage,
      ascending = true,
      search = '',
      orderBy = 'second_name',
      orderByTwo,
      includePhotos = false,
    } = options;
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString())
      .set('ascending', ascending.toString());

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    if (orderBy) {
      httpParams = httpParams.set('order_by', orderBy);
    }

    if (orderByTwo) {
      httpParams = httpParams.set('order_by_two', orderByTwo);
    }

    const endpoint = includePhotos
      ? `/api/players_team_tournament/tournament/${tournamentId}/players/paginated/details-with-photos`
      : `/api/players_team_tournament/tournament/${tournamentId}/players/paginated/details`;

    return this.http.get<PlayerTeamTournamentWithDetailsPaginatedResponse | PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse>(
      buildApiUrl(endpoint),
      { params: httpParams }
    );
  }

  getAvailablePlayersForTournament(tournamentId: number): Observable<PlayerWithPerson[]> {
    return this.http.get<PlayerWithPerson[]>(buildApiUrl(`/api/tournaments/id/${tournamentId}/players/available`));
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

  updatePlayerTeamTournament(id: number, data: { player_number?: string | null; team_id?: number | null; position_id?: number | null }): Observable<PlayerTeamTournament> {
    return this.apiService.put<PlayerTeamTournament>('/api/players_team_tournament/', id, data, true);
  }

  getPlayerCareer(playerId: number): Observable<PlayerCareer> {
    return this.http.get<PlayerCareer>(buildApiUrl(`/api/players/id/${playerId}/career`));
  }
}
