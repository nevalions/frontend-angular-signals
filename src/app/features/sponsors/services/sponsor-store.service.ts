import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Sponsor, SponsorsPaginatedResponse } from '../models/sponsor.model';
import { SponsorLine } from '../models/sponsor-line.model';

@Injectable({
  providedIn: 'root',
})
export class SponsorStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  sponsorsResource = httpResource<Sponsor[]>(() => buildApiUrl('/api/sponsors/'), { injector: this.injector });
  sponsorLinesResource = httpResource<SponsorLine[]>(() => buildApiUrl('/api/sponsor_lines'), { injector: this.injector });

  sponsors = computed(() => this.sponsorsResource.value() ?? []);
  sponsorLines = computed(() => this.sponsorLinesResource.value() ?? []);
  loading = computed(() => this.sponsorsResource.isLoading() || this.sponsorLinesResource.isLoading());
  error = computed(() => this.sponsorsResource.error() || this.sponsorLinesResource.error());

  reload(): void {
    this.sponsorsResource.reload();
    this.sponsorLinesResource.reload();
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
