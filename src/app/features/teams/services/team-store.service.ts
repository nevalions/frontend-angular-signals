import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Team, TeamCreate, TeamUpdate, TeamsPaginatedResponse, LogoUploadResponse } from '../models/team.model';
import { TeamTournament } from '../../tournaments/models/team-tournament.model';

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
    return this.apiService.put<Team>('/api/teams/', id, teamData, true).pipe(tap(() => this.reload()));
  }

  deleteTeam(id: number): Observable<void> {
    return this.apiService.delete('/api/teams', id).pipe(tap(() => this.reload()));
  }

  uploadTeamLogo(file: File): Observable<LogoUploadResponse> {
    return this.apiService.uploadFile<LogoUploadResponse>('/api/teams/upload_resize_logo', file);
  }

  getTeamsBySportIdPaginated(sportId: number, page: number, itemsPerPage: number, searchQuery?: string): Observable<TeamsPaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('items_per_page', itemsPerPage.toString());

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    return this.http.get<TeamsPaginatedResponse>(
      buildApiUrl(`/api/sports/id/${sportId}/teams/paginated`),
      { params }
    );
  }

  getTeamsByTournamentId(tournamentId: number): Observable<Team[]> {
    return this.apiService.customGet<Team[]>(buildApiUrl(`/api/team_in_tournament/tournament/id/${tournamentId}/teams`));
  }

  getAvailableTeamsForTournament(tournamentId: number): Observable<Team[]> {
    return this.apiService.customGet<Team[]>(buildApiUrl(`/api/tournaments/id/${tournamentId}/teams/available`));
  }

  addTeamToTournament(tournamentId: number, teamId: number): Observable<TeamTournament> {
    return this.apiService.post<TeamTournament>(`/api/team_in_tournament/${teamId}in${tournamentId}`, {});
  }

  removeTeamFromTournament(tournamentId: number, teamId: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/team_in_tournament/${teamId}in${tournamentId}`)).pipe(tap(() => this.reload()));
  }

  parseAndUpdateTeamFromEesl(eeslTeamId: number): Observable<Team> {
    return this.http.post<Team>(
      buildApiUrl(`/api/teams/pars_and_create/team/${eeslTeamId}`),
      null
    ).pipe(tap(() => this.reload()));
  }
}
