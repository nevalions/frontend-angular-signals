import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Team, TeamCreate, TeamUpdate, TeamsPaginatedResponse } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  teamsResource = httpResource<Team[]>(() => buildApiUrl('/api/teams/'), { injector: this.injector });

  teams = computed(() => this.teamsResource.value() ?? []);
  loading = computed(() => this.teamsResource.isLoading());
  error = computed(() => this.teamsResource.error());

  reload(): void {
    this.teamsResource.reload();
  }

  createTeam(teamData: TeamCreate): Observable<Team> {
    return this.apiService.post<Team>('/api/teams/', teamData).pipe(tap(() => this.reload()));
  }

  updateTeam(id: number, teamData: TeamUpdate): Observable<Team> {
    return this.apiService.put<Team>('/api/teams/', id, teamData).pipe(tap(() => this.reload()));
  }

  deleteTeam(id: number): Observable<void> {
    return this.apiService.delete('/api/teams', id).pipe(tap(() => this.reload()));
  }

  getTeamsBySportIdPaginated(sportId: number, page: number, perPage: number): Observable<TeamsPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<TeamsPaginatedResponse>(
      buildApiUrl(`/api/sports/id/${sportId}/teams/paginated`),
      { params }
    );
  }
}
