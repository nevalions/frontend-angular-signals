import { computed, inject, Injectable, Injector } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Sport, SportCreate, SportUpdate } from '../models/sport.model';
import { Player } from '../../players/models/player.model';

@Injectable({
  providedIn: 'root',
})
export class SportStoreService {
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  sportsResource = httpResource<Sport[]>(() => buildApiUrl('/api/sports/'), { injector: this.injector });

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
    return this.apiService.post<Sport>('/api/sports/', sportData).pipe(tap(() => this.reload()));
  }

  updateSport(id: number, sportData: SportUpdate): Observable<Sport> {
    return this.apiService.put<Sport>('/api/sports/', id, sportData, true).pipe(tap(() => this.reload()));
  }

  deleteSport(id: number): Observable<void> {
    return this.apiService.delete('/api/sports', id).pipe(tap(() => this.reload()));
  }

  getTournamentsBySport(sportId: number): Observable<unknown> {
    return this.apiService.customGet(buildApiUrl(`/api/sports/id/${sportId}/tournaments`));
  }

  getPlayersBySport(sportId: number): Observable<Player[]> {
    return this.apiService.customGet<Player[]>(buildApiUrl(`/api/sports/id/${sportId}/players`));
  }
}
