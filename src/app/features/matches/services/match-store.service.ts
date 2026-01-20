import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { MatchesPaginatedWithDetailsResponse, MatchCreate, Match, MatchUpdate, MatchWithDetails } from '../models/match.model';
import { MatchData } from '../models/match-data.model';
import { SortOrder } from '../../../core/models';

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

  tournamentId = signal<number | null>(null);
  page = signal<number>(1);
  itemsPerPage = signal<number>(10);
  sortOrder = signal<SortOrder>('asc');
  search = signal<string>('');

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

      let httpParams = new HttpParams()
        .set('page', params.page.toString())
        .set('items_per_page', params.itemsPerPage.toString())
        .set('order_by', 'week')
        .set('order_by_two', 'match_date')
        .set('ascending', (params.sortOrder === 'asc').toString())
        .set('tournament_id', params.tournamentId.toString());

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }

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
}
