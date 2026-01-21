import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { MatchesPaginatedWithDetailsResponse, MatchCreate, Match, MatchUpdate, MatchWithDetails } from '../models/match.model';
import { MatchData } from '../models/match-data.model';
import { ComprehensiveMatchData } from '../models/comprehensive-match.model';
import { MatchStats } from '../models/match-stats.model';
import { PlayerMatch, PlayerMatchCreate, PlayerMatchUpdate } from '../models/player-match.model';
import { MatchAvailablePlayer } from '../models/available-player.model';
import { SortOrder } from '../../../core/models';
import { buildPaginationParams, createPaginationState } from '../../../core/utils/pagination-helper.util';

interface MatchesResourceParams {
  tournamentId: number | null;
  page: number;
  itemsPerPage: number;
  sortOrder: SortOrder;
  search: string;
}

@Injectable({
  providedIn: 'root',
})
export class MatchStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);
  private pagination = createPaginationState();

  tournamentId = signal<number | null>(null);
  page = this.pagination.page;
  itemsPerPage = this.pagination.itemsPerPage;
  sortOrder = this.pagination.sortOrder;
  search = this.pagination.search;

  matchesResource = rxResource<MatchesPaginatedWithDetailsResponse, MatchesResourceParams>({
    params: computed(() => ({
      tournamentId: this.tournamentId(),
      page: this.page(),
      itemsPerPage: this.itemsPerPage(),
      sortOrder: this.sortOrder(),
      search: this.search(),
    })),
    stream: ({ params }: { params: MatchesResourceParams }) => {
      if (!params.tournamentId) {
        return new Observable<MatchesPaginatedWithDetailsResponse>(observer => {
          observer.next({ data: [], metadata: { page: 1, items_per_page: 10, total_items: 0, total_pages: 0, has_next: false, has_previous: false } });
          observer.complete();
        });
      }

      const httpParams = buildPaginationParams({
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        sortOrder: params.sortOrder,
        search: params.search,
      })
        .set('order_by', 'week')
        .set('order_by_two', 'match_date')
        .set('tournament_id', params.tournamentId.toString());

      return this.http.get<MatchesPaginatedWithDetailsResponse>(buildApiUrl('/api/matches/with-details/paginated'), { params: httpParams });
    },
    injector: this.injector,
  });

  matches = computed(() => this.matchesResource.value()?.data ?? []);
  loading = computed(() => this.matchesResource.isLoading());
  error = computed(() => this.matchesResource.error());

  totalCount = computed(() => this.matchesResource.value()?.metadata.total_items ?? 0);
  totalPages = computed(() => this.matchesResource.value()?.metadata.total_pages ?? 0);

  setTournamentId(tournamentId: number): void {
    this.tournamentId.set(tournamentId);
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
    this.matchesResource.reload();
  }

  getTournamentMatchesPaginated(
    tournamentId: number,
    page: number,
    itemsPerPage: number,
    ascending: boolean,
    search: string = '',
    week: number | null = null
  ): Observable<MatchesPaginatedWithDetailsResponse> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString())
      .set('order_by', 'week')
      .set('order_by_two', 'match_date')
      .set('ascending', ascending.toString())
      .set('tournament_id', tournamentId.toString());

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    if (week !== null) {
      httpParams = httpParams.set('week', week.toString());
    }

    return this.http.get<MatchesPaginatedWithDetailsResponse>(buildApiUrl('/api/matches/with-details/paginated'), { params: httpParams });
  }

  createMatch(data: MatchCreate): Observable<Match> {
    return this.apiService.post<Match>('/api/matches/', data).pipe(tap(() => this.reload()));
  }

  getMatchById(matchId: number): Observable<MatchWithDetails> {
    return this.http.get<MatchWithDetails>(buildApiUrl(`/api/matches/id/${matchId}/`));
  }

  getMatchData(matchId: number): Observable<MatchData> {
    return this.http.get<MatchData>(buildApiUrl(`/api/matches/id/${matchId}/match_data/`));
  }

  deleteMatch(matchId: number): Observable<void> {
    return this.apiService.delete('/api/matches/', matchId);
  }

  updateMatch(matchId: number, data: MatchUpdate): Observable<Match> {
    return this.apiService.put<Match>('/api/matches/', matchId, data);
  }

  getComprehensiveMatchData(matchId: number): Observable<ComprehensiveMatchData> {
    return this.http.get<ComprehensiveMatchData>(buildApiUrl(`/api/matches/id/${matchId}/comprehensive/`));
  }

  getMatchStats(matchId: number): Observable<MatchStats> {
    return this.http.get<MatchStats>(buildApiUrl(`/api/matches/id/${matchId}/stats/`));
  }

  updatePlayerMatch(playerMatchId: number, data: PlayerMatchUpdate): Observable<PlayerMatch> {
    return this.http.put<PlayerMatch>(buildApiUrl(`/api/players_match/${playerMatchId}/`), data);
  }

  getAvailablePlayersForTeamInMatch(matchId: number, teamId: number): Observable<MatchAvailablePlayer[]> {
    return this.http.get<MatchAvailablePlayer[]>(
      buildApiUrl(`/api/matches/id/${matchId}/team/${teamId}/available-players/`)
    );
  }

  addPlayerToMatch(data: PlayerMatchCreate): Observable<PlayerMatch> {
    return this.apiService.post<PlayerMatch>('/api/players_match/', data);
  }
}
