import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Sport, SportCreate, SportUpdate } from '../models/sport.model';

@Injectable({
  providedIn: 'root',
})
export class SportStoreService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private readonly alerts = inject(TuiAlertService);

  sportsResource = httpResource<Sport[]>(() => buildApiUrl('/api/sports/'));

  sports = computed(() => this.sportsResource.value() ?? []);
  loading = computed(() => this.sportsResource.isLoading());
  error = computed(() => this.sportsResource.error());

  sportById = computed(() => {
    const sportList = this.sports();
    const map = new Map<number, Sport>();
    sportList.forEach((sport) => map.set(sport.id, sport));
    return map;
  });

  reload(): void {
    this.sportsResource.reload();
  }

  createSport(sportData: SportCreate): Observable<Sport> {
    return this.apiService.post<Sport>('/api/sports/', sportData).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Sport created successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  updateSport(id: number, sportData: SportUpdate): Observable<Sport> {
    return this.apiService.put<Sport>('/api/sports/', id, sportData).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Sport updated successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  deleteSport(id: number): Observable<void> {
    return this.apiService.delete('/api/sports', id).pipe(
      tap(() => {
        this.reload();
        this.alerts.open('Sport deleted successfully', { label: 'Success' }).subscribe();
      })
    );
  }

  getTournamentsBySport(sportId: number): Observable<unknown> {
    return this.apiService.customGet(buildApiUrl(`/api/sports/id/${sportId}/tournaments`));
  }
}
