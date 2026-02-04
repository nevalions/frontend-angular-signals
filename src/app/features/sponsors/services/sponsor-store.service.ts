import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { buildPaginationParams, createPaginationState } from '../../../core/utils/pagination-helper.util';
import { SortOrder } from '../../../core/models';
import { Sponsor, SponsorsPaginatedResponse } from '../models/sponsor.model';
import { SponsorLine, SponsorLinesPaginatedResponse } from '../models/sponsor-line.model';

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
    return this.apiService.post<Sponsor>('/api/sponsors/', data).pipe(tap(() => this.reload()));
  }

  createSponsorLine(data: { title?: string | null; is_visible?: boolean | null }): Observable<SponsorLine> {
    return this.apiService.post<SponsorLine>('/api/sponsor_lines', data).pipe(tap(() => this.reload()));
  }
}
