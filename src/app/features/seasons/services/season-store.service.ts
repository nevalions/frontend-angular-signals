import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { buildApiUrl } from '../../../core/config/api.constants';
import { TuiAlertService } from '@taiga-ui/core';
import { Season, SeasonCreate, SeasonUpdate } from '../models/season.model';

@Injectable({
  providedIn: 'root',
})
export class SeasonStoreService {
  private http = inject(HttpClient);
  private router = inject(Router);
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
    return this.http.post<Season>(buildApiUrl('/api/seasons/'), seasonData).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Season created successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  updateSeason(id: number, seasonData: SeasonUpdate): Observable<Season> {
    return this.http.put<Season>(buildApiUrl(`/api/seasons/${id}`), seasonData).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Season updated successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  deleteSeason(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/seasons/${id}`)).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Season deleted successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  getTournamentsByYear(year: number): Observable<unknown> {
    return this.http.get(buildApiUrl(`/api/seasons/year/${year}/tournaments`));
  }
}
