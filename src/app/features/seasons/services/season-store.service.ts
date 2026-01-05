import { computed, inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Season, SeasonCreate, SeasonUpdate } from '../models/season.model';

@Injectable({
  providedIn: 'root',
})
export class SeasonStoreService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'), { injector: this.injector });

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
    return this.apiService.post<Season>('/api/seasons/', seasonData).pipe(tap(() => this.reload()));
  }

  updateSeason(id: number, seasonData: SeasonUpdate): Observable<Season> {
    return this.apiService.put<Season>('/api/seasons/', id, seasonData).pipe(tap(() => this.reload()));
  }

  deleteSeason(id: number): Observable<void> {
    return this.apiService.delete('/api/seasons', id).pipe(tap(() => this.reload()));
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
}
