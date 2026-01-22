import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../../../core/config/api.constants';
import { ComprehensiveMatchData } from '../../matches/models/comprehensive-match.model';
import { Scoreboard, ScoreboardUpdate } from '../../matches/models/scoreboard.model';
import { GameClock, GameClockUpdate } from '../../matches/models/gameclock.model';
import { PlayClock, PlayClockUpdate } from '../../matches/models/playclock.model';
import { MatchData, MatchDataUpdate } from '../../matches/models/match-data.model';
import { PlayerMatch, PlayerMatchUpdate } from '../../matches/models/player-match.model';

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
    return this.http.post<GameClock>(buildApiUrl(`/api/gameclock/${id}/start/`), null);
  }

  pauseGameClock(id: number): Observable<GameClock> {
    return this.http.post<GameClock>(buildApiUrl(`/api/gameclock/${id}/pause/`), null);
  }

  resetGameClock(id: number): Observable<GameClock> {
    return this.http.post<GameClock>(buildApiUrl(`/api/gameclock/${id}/reset/`), null);
  }

  // Play clock
  getPlayClock(matchId: number): Observable<PlayClock> {
    return this.http.get<PlayClock>(buildApiUrl(`/api/matches/id/${matchId}/playclock/`));
  }

  updatePlayClock(id: number, data: PlayClockUpdate): Observable<PlayClock> {
    return this.http.put<PlayClock>(buildApiUrl(`/api/playclock/${id}/`), data);
  }

  startPlayClock(id: number, seconds: number): Observable<PlayClock> {
    return this.http.post<PlayClock>(buildApiUrl(`/api/playclock/${id}/start/`), { seconds });
  }

  resetPlayClock(id: number): Observable<PlayClock> {
    return this.http.post<PlayClock>(buildApiUrl(`/api/playclock/${id}/reset/`), null);
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
}
