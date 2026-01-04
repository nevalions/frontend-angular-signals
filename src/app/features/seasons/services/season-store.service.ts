import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { debounceTime, filter, catchError, retry, tap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Season, SeasonCreate, SeasonUpdate } from '../models/season.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SeasonStoreService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private readonly alerts = inject(TuiAlertService);

  seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

  seasons = computed(() => this.seasonsResource.value() ?? []);
  loading = computed(() => this.seasonsResource.isLoading());
  error = computed(() => this.seasonsResource.error());

  seasonByYear = computed(() => {
    const seasons = this.seasons();
    const map = new Map<number, Season>();
    seasons.forEach((season) => map.set(season.year, season));
    return map;
  });

  reload(): void {
    this.seasonsResource.reload();
  }

  createSeason(seasonData: SeasonCreate): Observable<Season> {
    return this.apiService.post<Season>('/api/seasons/', seasonData).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Season created successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  updateSeason(id: number, seasonData: SeasonUpdate): Observable<Season> {
    return this.apiService.put<Season>('/api/seasons/', id, seasonData).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Season updated successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  deleteSeason(id: number): Observable<void> {
    return this.apiService.delete('/api/seasons', id).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Season deleted successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  getTournamentsByYear(year: number): Observable<unknown> {
    return this.apiService.customGet(buildApiUrl(`/api/seasons/year/${year}/tournaments`));
  }

  getTeamsByYear(year: number): Observable<unknown> {
    return this.apiService.customGet(buildApiUrl(`/api/seasons/year/${year}/teams`));
  }

  getMatchesByYear(year: number): Observable<unknown> {
    return this.apiService.customGet(buildApiUrl(`/api/seasons/year/${year}/matches`));
  }

  searchQuery = signal('');

  searchSeasonsResource = rxResource<Season[], { query: string }>({
    params: computed(() => ({ query: this.searchQuery() })),
    stream: ({ params }) =>
      this.http.get<Season[]>(buildApiUrl('/api/seasons/'), {
        params: { q: params.query },
      }).pipe(
        debounceTime(300),
        filter(() => this.searchQuery().length >= 2),
        tap(() => {
          console.log(`Searching seasons: ${this.searchQuery()}`);
        }),
        retry(3),
        catchError((err) => {
          console.error('Search error:', err);
          return of([]);
        }),
      ),
  });

  searchResults = computed(() => this.searchSeasonsResource.value() ?? []);
  searchLoading = computed(() => this.searchSeasonsResource.isLoading());
  searchError = computed(() => this.searchSeasonsResource.error());
}
