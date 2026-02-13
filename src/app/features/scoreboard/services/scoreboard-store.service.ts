import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { buildApiUrl } from '../../../core/config/api.constants';

/** Backend API response wrapper for clock endpoints */
interface ApiResponseWrapper<T> {
  content: T;
  status_code: number;
  success: boolean;
  message?: string;
}
import { ComprehensiveMatchData } from '../../matches/models/comprehensive-match.model';
import { Scoreboard, ScoreboardUpdate } from '../../matches/models/scoreboard.model';
import { GameClock, GameClockUpdate } from '../../matches/models/gameclock.model';
import { PlayClock, PlayClockUpdate } from '../../matches/models/playclock.model';
import { MatchData, MatchDataUpdate } from '../../matches/models/match-data.model';
import { PlayerMatch, PlayerMatchUpdate } from '../../matches/models/player-match.model';
import { FootballEvent, FootballEventCreate, FootballEventUpdate } from '../../matches/models/football-event.model';
import { MatchStats } from '../../matches/models/match-stats.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardStoreService {
  private http = inject(HttpClient);

  // Data fetching
  getComprehensiveMatchData(matchId: number): Observable<ComprehensiveMatchData> {
    return this.http.get<ComprehensiveMatchData>(buildApiUrl(`/api/matches/id/${matchId}/comprehensive/`));
  }

  // Scoreboard settings
  getScoreboard(matchId: number): Observable<Scoreboard> {
    return this.http.get<Scoreboard>(buildApiUrl(`/api/matches/id/${matchId}/scoreboard_data/`));
  }

  updateScoreboard(id: number, data: ScoreboardUpdate): Observable<Scoreboard> {
    return this.http.put<Scoreboard>(buildApiUrl(`/api/scoreboards/${id}/`), data);
  }

  // Game clock
  getGameClock(matchId: number): Observable<GameClock> {
    return this.http.get<GameClock>(buildApiUrl(`/api/matches/id/${matchId}/gameclock/`));
  }

  updateGameClock(id: number, data: GameClockUpdate): Observable<GameClock> {
    return this.http.put<GameClock>(buildApiUrl(`/api/gameclock/${id}/`), data);
  }

  startGameClock(id: number): Observable<GameClock> {
    // Backend returns wrapped response { content: GameClock, status_code, success, message }
    return this.http
      .put<ApiResponseWrapper<GameClock>>(buildApiUrl(`/api/gameclock/id/${id}/running/`), null)
      .pipe(map((response) => response.content));
  }

  pauseGameClock(id: number): Observable<GameClock> {
    // Backend returns wrapped response { content: GameClock, status_code, success, message }
    return this.http
      .put<ApiResponseWrapper<GameClock>>(buildApiUrl(`/api/gameclock/id/${id}/paused/`), null)
      .pipe(map((response) => response.content));
  }

  resetGameClock(id: number, seconds: number): Observable<GameClock> {
    return this.http
      .put<ApiResponseWrapper<GameClock>>(buildApiUrl(`/api/gameclock/id/${id}/stopped/${seconds}/`), null)
      .pipe(map((response) => response.content));
  }

  resetGameClockPeriodAware(id: number): Observable<GameClock> {
    return this.http
      .put<ApiResponseWrapper<GameClock>>(buildApiUrl(`/api/gameclock/id/${id}/reset/`), null)
      .pipe(map((response) => response.content));
  }

  // Play clock
  getPlayClock(matchId: number): Observable<PlayClock> {
    return this.http.get<PlayClock>(buildApiUrl(`/api/matches/id/${matchId}/playclock/`));
  }

  updatePlayClock(id: number, data: PlayClockUpdate): Observable<PlayClock> {
    return this.http.put<PlayClock>(buildApiUrl(`/api/playclock/${id}/`), data);
  }

  startPlayClock(id: number, seconds: number): Observable<PlayClock> {
    // Backend returns wrapped response { content: PlayClock, status_code, success, message }
    return this.http
      .put<ApiResponseWrapper<PlayClock>>(buildApiUrl(`/api/playclock/id/${id}/running/${seconds}/`), null)
      .pipe(map((response) => response.content));
  }

  resetPlayClock(id: number): Observable<PlayClock> {
    // Backend returns wrapped response { content: PlayClock, status_code, success, message }
    return this.http
      .put<ApiResponseWrapper<PlayClock>>(buildApiUrl(`/api/playclock/id/${id}/stopped/`), null)
      .pipe(map((response) => response.content));
  }

  // Match data
  updateMatchData(id: number, data: MatchDataUpdate): Observable<MatchData> {
    return this.http.put<MatchData>(buildApiUrl(`/api/matchdata/${id}/`), data);
  }

  updateMatchDataKeyValue(id: number, key: string, value: unknown): Observable<MatchData> {
    return this.http.put<MatchData>(buildApiUrl(`/api/matchdata/${id}/`), { [key]: value });
  }

  updatePlayerMatch(playerMatchId: number, data: PlayerMatchUpdate): Observable<PlayerMatch> {
    return this.http.put<PlayerMatch>(buildApiUrl(`/api/players_match/${playerMatchId}/`), data);
  }

  // Match stats
  getMatchStats(matchId: number): Observable<MatchStats> {
    return this.http.get<MatchStats>(buildApiUrl(`/api/matches/id/${matchId}/stats/`));
  }

  // Football events
  getMatchEvents(matchId: number): Observable<FootballEvent[]> {
    return this.http.get<FootballEvent[]>(buildApiUrl(`/api/football_event/match_id/${matchId}/`));
  }

  createFootballEvent(data: FootballEventCreate): Observable<FootballEvent> {
    return this.http.post<FootballEvent>(buildApiUrl('/api/football_event/'), data);
  }

  updateFootballEvent(id: number, data: FootballEventUpdate): Observable<FootballEvent> {
    return this.http.put<FootballEvent>(buildApiUrl(`/api/football_event/${id}/`), data);
  }

  deleteFootballEvent(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/football_event/id/${id}`));
  }

  uploadMatchTeamLogo(matchId: number, file: File): Observable<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ logoUrl: string }>(buildApiUrl(`/api/matches/id/${matchId}/upload_team_logo`), formData);
  }
}
