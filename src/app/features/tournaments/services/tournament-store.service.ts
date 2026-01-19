import { computed, inject, Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { buildApiUrl } from '../../../core/config/api.constants';
import { Tournament, TournamentCreate, TournamentUpdate } from '../models/tournament.model';
import { Team } from '../../teams/models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TournamentStoreService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private readonly injector = inject(Injector);

  tournamentsResource = httpResource<Tournament[]>(() => buildApiUrl('/api/tournaments/'), { injector: this.injector });

  tournaments = computed(() => this.tournamentsResource.value() ?? []);
  loading = computed(() => this.tournamentsResource.isLoading());
  error = computed(() => this.tournamentsResource.error());

  tournamentsBySeason = computed(() => {
    const tournaments = this.tournaments();
    const map = new Map<number, Tournament[]>();
    tournaments.forEach((t) => {
      const existing = map.get(t.season_id) || [];
      existing.push(t);
      map.set(t.season_id, existing);
    });
    return map;
  });

  tournamentsBySport = computed(() => {
    const tournaments = this.tournaments();
    const map = new Map<number, Tournament[]>();
    tournaments.forEach((t) => {
      const existing = map.get(t.sport_id) || [];
      existing.push(t);
      map.set(t.sport_id, existing);
    });
    return map;
  });

  tournamentsBySportAndSeason = computed(() => {
    const tournaments = this.tournaments();
    const map = new Map<string, Tournament[]>();
    tournaments.forEach((t) => {
      const key = `${t.sport_id}-${t.season_id}`;
      const existing = map.get(key) || [];
      existing.push(t);
      map.set(key, existing);
    });
    return map;
  });

  reload(): void {
    this.tournamentsResource.reload();
  }

  createTournament(data: TournamentCreate): Observable<Tournament> {
    return this.http.post<Tournament>(buildApiUrl('/api/tournaments/'), data).pipe(tap(() => this.reload()));
  }

  updateTournament(id: number, data: TournamentUpdate): Observable<Tournament> {
    return this.http.put<Tournament>(buildApiUrl(`/api/tournaments/${id}`), data).pipe(tap(() => this.reload()));
  }

  deleteTournament(id: number): Observable<void> {
    return this.apiService.delete('/api/tournaments', id).pipe(tap(() => this.reload()));
  }

  getTournamentsBySeasonAndSport(year: number, sportId: number): Observable<Tournament[]> {
    return this.apiService.customGet<Tournament[]>(
      buildApiUrl(`/api/seasons/year/${year}/sports/id/${sportId}/tournaments`)
    );
  }

  uploadTournamentLogo(file: File): Observable<{ original: string; icon: string; webview: string }> {
    return this.apiService.uploadFile<{ original: string; icon: string; webview: string }>('/api/tournaments/upload_resize_logo', file);
  }

  getTeamsByTournamentId(tournamentId: number): Observable<Team[]> {
    return this.http.get<Team[]>(buildApiUrl(`/api/team_in_tournament/tournament/id/${tournamentId}/teams`));
  }

  parseEESLSeason(eeslSeasonId: number): Observable<TournamentCreate[]> {
    return this.http.get<TournamentCreate[]>(buildApiUrl(`/api/tournaments/pars/season/${eeslSeasonId}`));
  }

  parseAndCreateEESLSeason(eeslSeasonId: number, seasonId: number, sportId: number): Observable<Tournament[]> {
    return this.http.post<Tournament[]>(buildApiUrl(`/api/tournaments/pars_and_create/season/${eeslSeasonId}`), null, {
      params: { season_id: seasonId, sport_id: sportId }
    }).pipe(tap(() => this.reload()));
  }

  parseEESLTournamentTeams(eeslTournamentId: number): Observable<Team[]> {
    return this.http.post<[Team[], unknown]>(buildApiUrl(`/api/teams/pars_and_create/tournament/${eeslTournamentId}`), null)
      .pipe(map(([teams]) => teams));
  }
}
