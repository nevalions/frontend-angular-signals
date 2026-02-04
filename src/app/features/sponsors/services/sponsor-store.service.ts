import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { buildPaginationParams, createPaginationState } from '../../../core/utils/pagination-helper.util';
import { SortOrder } from '../../../core/models';
import { Sponsor, SponsorLogoUploadResponse, SponsorsPaginatedResponse } from '../models/sponsor.model';
import type { Match } from '../../matches/models/match.model';
import type { Team } from '../../teams/models/team.model';
import type { Tournament } from '../../tournaments/models/tournament.model';
import { SponsorLine, SponsorLineUpdate, SponsorLinesPaginatedResponse } from '../models/sponsor-line.model';

export type SponsorLineConnectionsResponse = {
  sponsor_line: SponsorLine | null;
  sponsors: Array<{ sponsor: Sponsor; position: number | null }>;
};

@Injectable({
  providedIn: 'root',
})
export class SponsorStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);
  private sponsorsPagination = createPaginationState();
  private sponsorLinesPagination = createPaginationState();
  private sponsorLinesLookupPagination = createPaginationState({ itemsPerPage: 100 });

  sponsorsResource = httpResource<Sponsor[]>(() => buildApiUrl('/api/sponsors/'), { injector: this.injector });

  sponsorsPaginatedResource = rxResource({
    params: computed(() => ({
      page: this.sponsorsPagination.page(),
      itemsPerPage: this.sponsorsPagination.itemsPerPage(),
      sortOrder: this.sponsorsPagination.sortOrder(),
      search: this.sponsorsPagination.search(),
    })),
    stream: ({ params }) => {
      const httpParams = buildPaginationParams({
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        sortOrder: params.sortOrder,
        search: params.search,
      })
        .set('order_by', 'title')
        .set('order_by_two', 'id');

      return this.http.get<SponsorsPaginatedResponse>(buildApiUrl('/api/sponsors/paginated'), { params: httpParams });
    },
    injector: this.injector,
  });

  sponsorLinesPaginatedResource = rxResource({
    params: computed(() => ({
      page: this.sponsorLinesPagination.page(),
      itemsPerPage: this.sponsorLinesPagination.itemsPerPage(),
      sortOrder: this.sponsorLinesPagination.sortOrder(),
      search: this.sponsorLinesPagination.search(),
    })),
    stream: ({ params }) => {
      const httpParams = buildPaginationParams({
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        sortOrder: params.sortOrder,
        search: params.search,
      })
        .set('order_by', 'title')
        .set('order_by_two', 'id');

      return this.http.get<SponsorLinesPaginatedResponse>(buildApiUrl('/api/sponsor_lines/paginated'), { params: httpParams });
    },
    injector: this.injector,
  });

  sponsorLinesLookupResource = rxResource({
    params: computed(() => ({
      page: this.sponsorLinesLookupPagination.page(),
      itemsPerPage: this.sponsorLinesLookupPagination.itemsPerPage(),
      sortOrder: this.sponsorLinesLookupPagination.sortOrder(),
      search: this.sponsorLinesLookupPagination.search(),
    })),
    stream: ({ params }) => {
      const httpParams = buildPaginationParams({
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        sortOrder: params.sortOrder,
        search: params.search,
      })
        .set('order_by', 'title')
        .set('order_by_two', 'id');

      return this.http.get<SponsorLinesPaginatedResponse>(buildApiUrl('/api/sponsor_lines/paginated'), { params: httpParams });
    },
    injector: this.injector,
  });

  sponsors = computed(() => this.sponsorsResource.value() ?? []);
  sponsorLines = computed(() => this.sponsorLinesLookupResource.value()?.data ?? []);
  sponsorsPaginated = computed(() => this.sponsorsPaginatedResource.value()?.data ?? []);
  sponsorLinesPaginated = computed(() => this.sponsorLinesPaginatedResource.value()?.data ?? []);
  loading = computed(() => this.sponsorsResource.isLoading() || this.sponsorLinesLookupResource.isLoading());
  error = computed(() => this.sponsorsResource.error() || this.sponsorLinesLookupResource.error());
  sponsorsPaginatedLoading = computed(() => this.sponsorsPaginatedResource.isLoading());
  sponsorsPaginatedError = computed(() => this.sponsorsPaginatedResource.error());
  sponsorLinesPaginatedLoading = computed(() => this.sponsorLinesPaginatedResource.isLoading());
  sponsorLinesPaginatedError = computed(() => this.sponsorLinesPaginatedResource.error());

  sponsorsPage = this.sponsorsPagination.page;
  sponsorsItemsPerPage = this.sponsorsPagination.itemsPerPage;
  sponsorsSortOrder = this.sponsorsPagination.sortOrder;
  sponsorsSearch = this.sponsorsPagination.search;

  sponsorLinesPage = this.sponsorLinesPagination.page;
  sponsorLinesItemsPerPage = this.sponsorLinesPagination.itemsPerPage;
  sponsorLinesSortOrder = this.sponsorLinesPagination.sortOrder;
  sponsorLinesSearch = this.sponsorLinesPagination.search;

  sponsorsTotalCount = computed(() => this.sponsorsPaginatedResource.value()?.metadata.total_items ?? 0);
  sponsorsTotalPages = computed(() => this.sponsorsPaginatedResource.value()?.metadata.total_pages ?? 0);
  sponsorLinesTotalCount = computed(() => this.sponsorLinesPaginatedResource.value()?.metadata.total_items ?? 0);
  sponsorLinesTotalPages = computed(() => this.sponsorLinesPaginatedResource.value()?.metadata.total_pages ?? 0);

  reload(): void {
    this.sponsorsResource.reload();
    this.sponsorLinesLookupResource.reload();
  }

  reloadSponsorsList(): void {
    this.sponsorsResource.reload();
    this.sponsorsPaginatedResource.reload();
  }

  reloadSponsorLinesList(): void {
    this.sponsorLinesLookupResource.reload();
    this.sponsorLinesPaginatedResource.reload();
  }

  setSponsorsPage(page: number): void {
    this.sponsorsPagination.setPage(page);
  }

  setSponsorsItemsPerPage(itemsPerPage: number): void {
    this.sponsorsPagination.setItemsPerPage(itemsPerPage);
  }

  setSponsorsSortOrder(sortOrder: SortOrder): void {
    this.sponsorsPagination.setSortOrder(sortOrder);
  }

  setSponsorsSearch(query: string): void {
    this.sponsorsPagination.setSearch(query);
  }

  setSponsorLinesPage(page: number): void {
    this.sponsorLinesPagination.setPage(page);
  }

  setSponsorLinesItemsPerPage(itemsPerPage: number): void {
    this.sponsorLinesPagination.setItemsPerPage(itemsPerPage);
  }

  setSponsorLinesSortOrder(sortOrder: SortOrder): void {
    this.sponsorLinesPagination.setSortOrder(sortOrder);
  }

  setSponsorLinesSearch(query: string): void {
    this.sponsorLinesPagination.setSearch(query);
  }

  getSponsorsPaginated(page: number, itemsPerPage: number): Observable<SponsorsPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString());

    return this.http.get<SponsorsPaginatedResponse>(
      buildApiUrl('/api/sponsors/'),
      { params }
    );
  }

  createSponsor(data: { title: string; logo_url?: string | null; scale_logo?: number | null }): Observable<Sponsor> {
    return this.apiService.post<Sponsor>('/api/sponsors/', data).pipe(tap(() => this.reloadSponsorsList()));
  }

  updateSponsor(id: number, data: { title?: string; logo_url?: string | null; scale_logo?: number | null }): Observable<Sponsor> {
    return this.apiService.put<Sponsor>('/api/sponsors/', id, data, true).pipe(tap(() => this.reloadSponsorsList()));
  }

  uploadSponsorLogo(file: File): Observable<SponsorLogoUploadResponse> {
    return this.apiService.uploadFile<SponsorLogoUploadResponse>('/api/sponsors/upload_logo', file);
  }

  createSponsorLine(data: { title?: string | null; is_visible?: boolean | null }): Observable<SponsorLine> {
    return this.apiService.post<SponsorLine>('/api/sponsor_lines', data).pipe(tap(() => this.reload()));
  }

  getSponsorLineById(id: number): Observable<SponsorLine> {
    return this.apiService.get<SponsorLine>(`/api/sponsor_lines/id/${id}/`);
  }

  updateSponsorLine(id: number, data: SponsorLineUpdate): Observable<SponsorLine> {
    return this.apiService.put<SponsorLine>('/api/sponsor_lines/', id, data, true).pipe(
      tap(() => this.reloadSponsorLinesList())
    );
  }

  deleteSponsor(id: number): Observable<void> {
    return this.apiService.delete('/api/sponsors', id).pipe(tap(() => this.reloadSponsorsList()));
  }

  deleteSponsorLine(id: number): Observable<void> {
    return this.apiService.delete('/api/sponsor_lines', id).pipe(tap(() => this.reloadSponsorLinesList()));
  }

  deleteSponsorWithConnections(sponsorId: number, sponsorLines: SponsorLine[]): Observable<void> {
    const resolvedSponsorLines = sponsorLines.length > 0 ? sponsorLines : this.sponsorLines();

    return forkJoin({
      teams: this.apiService.get<Team[]>('/api/teams/').pipe(catchError(() => of([]))),
      tournaments: this.apiService.get<Tournament[]>('/api/tournaments/').pipe(catchError(() => of([]))),
      matches: this.apiService.get<Match[]>('/api/matches/').pipe(catchError(() => of([]))),
    }).pipe(
      switchMap(({ teams, tournaments, matches }) => {
        const updates = [
          ...teams
            .filter((team) => team.main_sponsor_id === sponsorId)
            .map((team) =>
              this.apiService.put('/api/teams/', team.id, { main_sponsor_id: null }, true)
                .pipe(catchError(() => of(null)))
            ),
          ...tournaments
            .filter((tournament) => tournament.main_sponsor_id === sponsorId)
            .map((tournament) =>
              this.apiService.put('/api/tournaments/', tournament.id, { main_sponsor_id: null }, true)
                .pipe(catchError(() => of(null)))
            ),
          ...matches
            .filter((match) => match.main_sponsor_id === sponsorId)
            .map((match) =>
              this.apiService.put('/api/matches/', match.id, { main_sponsor_id: null }, true)
                .pipe(catchError(() => of(null)))
            ),
        ];

        return this.getSponsorLineConnections(sponsorId, resolvedSponsorLines).pipe(
          switchMap((connectedLines) => {
            const deletions = connectedLines.map((line) =>
              this.http
                .delete<void>(buildApiUrl(`/api/sponsor_in_sponsor_line/${sponsorId}in${line.id}`))
                .pipe(catchError(() => of(null)))
            );

            if (updates.length === 0 && deletions.length === 0) {
              return this.deleteSponsor(sponsorId);
            }

            return forkJoin([...updates, ...deletions]).pipe(
              switchMap(() => this.deleteSponsor(sponsorId))
            );
          })
        );
      })
    );
  }

  getSponsorsInSponsorLine(sponsorLineId: number): Observable<SponsorLineConnectionsResponse> {
    return this.http.get<SponsorLineConnectionsResponse>(
      buildApiUrl(`/api/sponsor_in_sponsor_line/sponsor_line/id/${sponsorLineId}/sponsors`)
    );
  }

  deleteSponsorLineWithConnections(sponsorLineId: number): Observable<void> {
    return forkJoin({
      teams: this.apiService.get<Team[]>('/api/teams/').pipe(catchError(() => of([]))),
      tournaments: this.apiService.get<Tournament[]>('/api/tournaments/').pipe(catchError(() => of([]))),
      matches: this.apiService.get<Match[]>('/api/matches/').pipe(catchError(() => of([]))),
    }).pipe(
      switchMap(({ teams, tournaments, matches }) => {
        const updates = [
          ...teams
            .filter((team) => team.sponsor_line_id === sponsorLineId)
            .map((team) =>
              this.apiService.put('/api/teams/', team.id, { sponsor_line_id: null }, true)
                .pipe(catchError(() => of(null)))
            ),
          ...tournaments
            .filter((tournament) => tournament.sponsor_line_id === sponsorLineId)
            .map((tournament) =>
              this.apiService.put('/api/tournaments/', tournament.id, { sponsor_line_id: null }, true)
                .pipe(catchError(() => of(null)))
            ),
          ...matches
            .filter((match) => match.sponsor_line_id === sponsorLineId)
            .map((match) =>
              this.apiService.put('/api/matches/', match.id, { sponsor_line_id: null }, true)
                .pipe(catchError(() => of(null)))
            ),
        ];

        return this.getSponsorsInSponsorLine(sponsorLineId).pipe(
          catchError(() => of({ sponsor_line: null, sponsors: [] })),
          switchMap((response) => {
            const deletions = response.sponsors.map((entry) =>
              this.http
                .delete<void>(buildApiUrl(`/api/sponsor_in_sponsor_line/${entry.sponsor.id}in${sponsorLineId}`))
                .pipe(catchError(() => of(null)))
            );

            if (updates.length === 0 && deletions.length === 0) {
              return this.deleteSponsorLine(sponsorLineId);
            }

            return forkJoin([...updates, ...deletions]).pipe(
              switchMap(() => this.deleteSponsorLine(sponsorLineId))
            );
          })
        );
      })
    );
  }

  addSponsorToLine(sponsorId: number, sponsorLineId: number): Observable<void> {
    return this.apiService.post<void>(`/api/sponsor_in_sponsor_line/${sponsorId}in${sponsorLineId}`, {}).pipe(
      tap(() => this.reload())
    );
  }

  removeSponsorFromLine(sponsorId: number, sponsorLineId: number): Observable<void> {
    return this.http
      .delete<void>(buildApiUrl(`/api/sponsor_in_sponsor_line/${sponsorId}in${sponsorLineId}`))
      .pipe(tap(() => this.reload()));
  }

  getSponsorLineConnections(sponsorId: number, sponsorLines: SponsorLine[]): Observable<SponsorLine[]> {
    if (sponsorLines.length === 0) {
      return of([]);
    }

    const requests = sponsorLines.map((line) =>
      this.http
        .get<SponsorLineConnectionsResponse>(buildApiUrl(`/api/sponsor_in_sponsor_line/sponsor_line/id/${line.id}/sponsors`))
        .pipe(
          map((response) => (response.sponsors.some((entry) => entry.sponsor.id === sponsorId) ? line : null)),
          catchError(() => of(null))
        )
    );

    return forkJoin(requests).pipe(
      map((results) => results.filter((line): line is SponsorLine => line !== null))
    );
  }
}
