import { WritableSignal } from '@angular/core';
import { GameClock } from '../../features/matches/models/gameclock.model';
import { PlayClock } from '../../features/matches/models/playclock.model';
import { MatchData } from '../../features/matches/models/match-data.model';
import { FootballEvent } from '../../features/matches/models/football-event.model';
import { MatchStats } from '../../features/matches/models/match-stats.model';
import { MatchWithDetails, Team } from '../../features/matches/models/match.model';
import { PlayerMatchWithDetails } from '../../features/matches/models/comprehensive-match.model';
import type { ComprehensiveMatchData, WebSocketMessage } from './websocket.service';

export interface WebSocketMessageHandlerContext {
  getCurrentMatchId: () => number | null;
  log: (...args: unknown[]) => void;
  debugLog: (...args: unknown[]) => void;
  logClock: (type: 'gameclock' | 'playclock', action: string, data: unknown) => void;
  sendMessage: (message: unknown) => void;
  mergeGameClock: (update: GameClock) => GameClock;
  mergePlayClock: (update: PlayClock) => PlayClock;
  matchData: WritableSignal<ComprehensiveMatchData | null>;
  gameClock: WritableSignal<GameClock | null>;
  playClock: WritableSignal<PlayClock | null>;
  events: WritableSignal<FootballEvent[]>;
  statistics: WritableSignal<MatchStats | null>;
  lastEventUpdate: WritableSignal<number | null>;
  lastStatsUpdate: WritableSignal<number | null>;
  matchDataPartial: WritableSignal<MatchData | null>;
  scoreboardPartial: WritableSignal<unknown | null>;
  matchPartial: WritableSignal<MatchWithDetails | null>;
  teamsPartial: WritableSignal<{ team_a: Team; team_b: Team } | null>;
  playersPartial: WritableSignal<PlayerMatchWithDetails[] | null>;
  eventsPartial: WritableSignal<FootballEvent[] | null>;
  lastMatchDataUpdate: WritableSignal<number | null>;
  lastMatchUpdate: WritableSignal<number | null>;
  lastTeamsUpdate: WritableSignal<number | null>;
  lastPlayersUpdate: WritableSignal<number | null>;
  lastEventsUpdate: WritableSignal<number | null>;
  lastPingReceived: WritableSignal<number | null>;
  lastRtt: WritableSignal<number | null>;
}

export class WebSocketMessageHandlers {
  constructor(private readonly context: WebSocketMessageHandlerContext) {}

  handleMessage(message: WebSocketMessage): void {
    this.context.log('Message received:', JSON.stringify(message, null, 2));

    const messageType = message['type'] as string | undefined;
    this.context.debugLog('[WebSocket][DEBUG] Message type:', messageType, 'Keys in message:', Object.keys(message));

    const data = message['data'] as Record<string, unknown> | undefined;
    if (data) {
      this.context.debugLog('[WebSocket][DEBUG] Data keys:', Object.keys(data));
    }

    if (messageType === 'ping') {
      this.handlePing(message);
      return;
    }

    if (messageType === 'playclock-update' || ('playclock' in message && message.playclock !== undefined && !('data' in message))) {
      this.context.logClock('playclock', 'RECEIVED playclock-update message', { messageType, hasPlayclock: 'playclock' in message });
      const playclock = (message.playclock ?? (data?.['playclock'] as PlayClock | undefined)) ?? null;
      this.context.logClock('playclock', 'Extracted playclock data', playclock);
      if (playclock !== undefined) {
        if (playclock === null) {
          this.context.playClock.set(null);
          this.context.logClock('playclock', 'Signal set to null', null);
        } else {
          const currentPlayClock = this.context.playClock();
          this.context.logClock('playclock', 'Current playClock before merge', currentPlayClock);
          const merged = this.context.mergePlayClock(playclock);
          this.context.logClock('playclock', 'Merged playClock to set', merged);
          this.context.playClock.set(merged);
          this.context.logClock('playclock', 'Signal updated, new value', this.context.playClock());
        }
      } else {
        this.context.logClock('playclock', 'SKIPPED - no playclock data extracted', null);
      }
      return;
    }

    if (messageType === 'gameclock-update' || ('gameclock' in message && message.gameclock !== undefined && !('data' in message))) {
      this.context.logClock('gameclock', 'RECEIVED gameclock-update message', { messageType, hasGameclock: 'gameclock' in message });
      const gameclock = (message.gameclock ?? (data?.['gameclock'] as GameClock | undefined)) ?? null;
      this.context.logClock('gameclock', 'Extracted gameclock data', gameclock);
      if (gameclock !== undefined) {
        const messageMatchId = message['match_id'] as number | undefined;
        if (this.context.getCurrentMatchId() === messageMatchId) {
          if (gameclock === null) {
            this.context.gameClock.set(null);
            this.context.logClock('gameclock', 'Signal set to null', null);
          } else {
            const currentGameClock = this.context.gameClock();
            this.context.logClock('gameclock', 'Current gameClock before merge', currentGameClock);
            const merged = this.context.mergeGameClock(gameclock);
            this.context.logClock('gameclock', 'Merged gameClock to set', merged);
            this.context.gameClock.set(merged);
            this.context.logClock('gameclock', 'Signal updated, new value', this.context.gameClock());
          }
        } else {
          this.context.logClock(
            'gameclock',
            'Skipping gameclock update for different match: messageMatchId=' + messageMatchId + ', currentMatchId=' + this.context.getCurrentMatchId(),
            null
          );
        }
      } else {
        this.context.logClock('gameclock', 'SKIPPED - no gameclock data extracted', null);
      }
      return;
    }

    if (messageType === 'event-update') {
      this.handleEventUpdate(message);
      return;
    }

    if (messageType === 'statistics-update') {
      this.handleStatisticsUpdate(message);
      return;
    }

    if (messageType === 'players-update') {
      this.handlePlayersUpdate(message);
      return;
    }

    if (messageType === 'initial-load') {
      const initialData = message['data'] as Record<string, unknown> | undefined;
      if (initialData) {
        const matchData: ComprehensiveMatchData = {
          match_data: initialData['match_data'] as MatchData | undefined,
          scoreboard: initialData['scoreboard_data'],
          match: initialData['match'] as unknown,
          teams: initialData['teams_data'] as unknown,
          gameclock: initialData['gameclock'] as GameClock | undefined,
          playclock: initialData['playclock'] as PlayClock | undefined,
          events: initialData['events'] as FootballEvent[] | undefined,
          players: (initialData['players'] as PlayerMatchWithDetails[] | undefined) || [],
        };

        this.context.matchData.set(matchData);

        if (matchData.gameclock) {
          this.context.gameClock.set(this.context.mergeGameClock(matchData.gameclock));
        }
        if (matchData.playclock) {
          this.context.playClock.set(this.context.mergePlayClock(matchData.playclock));
        }

        const scoreboardData = initialData['scoreboard_data'];
        if (scoreboardData) {
          this.context.scoreboardPartial.set(scoreboardData);
        }

        const players = initialData['players'] as PlayerMatchWithDetails[] | undefined;
        if (players) {
          this.context.playersPartial.set(players);
          this.context.lastPlayersUpdate.set(Date.now());
        }

        if (matchData.events) {
          this.context.events.set(matchData.events);
          this.context.lastEventUpdate.set(Date.now());
        }
        const stats = initialData['statistics'] as MatchStats | undefined;
        if (stats) {
          this.context.statistics.set(stats);
          this.context.lastStatsUpdate.set(Date.now());
        }

        this.context.log('Initial load data received via WebSocket', {
          hasMatch: !!matchData['match'],
          hasTeams: !!matchData['teams'],
          hasScoreboard: !!matchData.scoreboard,
          hasEvents: !!matchData.events,
          hasStats: !!stats,
        });
      }
      return;
    }

    if (messageType === 'message-update' || messageType === 'match-update') {
      this.context.log('Match data update');
      if (data) {
        const hasMatchDataFields = [
          'score_team_a',
          'score_team_b',
          'qtr',
          'down',
          'distance',
          'ball_on',
          'timeout_team_a',
          'timeout_team_b',
          'field_length',
          'game_status',
        ].some((field) => field in data);

        if (hasMatchDataFields) {
          this.context.matchDataPartial.set(data as unknown as MatchData);
          this.context.lastMatchDataUpdate.set(Date.now());
        } else {
          const matchData = data['match_data'] as MatchData | undefined;
          if (matchData) {
            this.context.matchDataPartial.set(matchData);
            this.context.lastMatchDataUpdate.set(Date.now());
          }
        }

        const scoreboardData = data['scoreboard_data'];
        if (scoreboardData) {
          this.context.scoreboardPartial.set(scoreboardData);
        }

        const match = data['match'] as MatchWithDetails | undefined;
        if (match) {
          this.context.matchPartial.set(match);
          this.context.lastMatchUpdate.set(Date.now());
        }

        const teams = data['teams_data'] as { team_a: Team; team_b: Team } | undefined;
        if (teams) {
          this.context.teamsPartial.set(teams);
          this.context.lastTeamsUpdate.set(Date.now());
        }

        const players = data['players'] as PlayerMatchWithDetails[] | undefined;
        if (players) {
          this.context.playersPartial.set(players);
          this.context.lastPlayersUpdate.set(Date.now());
        }

        const events = data['events'] as FootballEvent[] | undefined;
        if (events) {
          this.context.eventsPartial.set(events);
          this.context.lastEventsUpdate.set(Date.now());
        }

        const gameclock = data['gameclock'] as GameClock | undefined;
        if (gameclock !== undefined) {
          if (gameclock === null) {
            this.context.gameClock.set(null);
          } else {
            this.context.gameClock.set(this.context.mergeGameClock(gameclock));
          }
        }

        const playclock = data['playclock'] as PlayClock | undefined;
        if (playclock !== undefined) {
          if (playclock === null) {
            this.context.playClock.set(null);
          } else {
            this.context.playClock.set(this.context.mergePlayClock(playclock));
          }
        }
      }
      return;
    }

    this.context.log('Unknown message type, using as-is');
    this.context.matchData.set(message as ComprehensiveMatchData);
  }

  handlePing(message: WebSocketMessage): void {
    const serverTimestamp = message['timestamp'] as number;
    this.context.log('Received ping, sending pong');

    const now = Date.now() / 1000;

    this.context.sendMessage({
      type: 'pong',
      timestamp: serverTimestamp,
    });

    this.context.lastPingReceived.set(Date.now());

    if (serverTimestamp) {
      const rtt = (now - serverTimestamp) * 1000;
      this.context.lastRtt.set(rtt);
    }
  }

  handleEventUpdate(message: WebSocketMessage): void {
    try {
      const events = message['events'] as FootballEvent[] | undefined;
      const matchId = message['match_id'] as number | undefined;

      this.context.log(`Received ${events?.length ?? 0} events for match ${matchId}`);

      if (events) {
        this.context.events.set(events);
        this.context.lastEventUpdate.set(Date.now());
        this.context.log('Events updated via WebSocket', { count: events.length });
      }
    } catch (error) {
      console.error('[WebSocket] Error handling event update:', error);
    }
  }

  handleStatisticsUpdate(message: WebSocketMessage): void {
    try {
      const stats = message['statistics'] as MatchStats | undefined;
      const matchId = message['match_id'] as number | undefined;

      this.context.log(`Received statistics for match ${matchId}`);

      if (stats) {
        this.context.statistics.set(stats);
        this.context.lastStatsUpdate.set(Date.now());
        this.context.log('Statistics updated via WebSocket');
      }
    } catch (error) {
      console.error('[WebSocket] Error handling statistics update:', error);
    }
  }

  handlePlayersUpdate(message: WebSocketMessage): void {
    try {
      const data = message['data'] as Record<string, unknown> | undefined;
      const players = data?.['players'] as PlayerMatchWithDetails[] | undefined;
      const matchId = data?.['match_id'] as number | undefined;

      this.context.log(`Received ${players?.length ?? 0} players for match ${matchId}`);

      if (players) {
        this.context.playersPartial.set(players);
        this.context.lastPlayersUpdate.set(Date.now());
        this.context.log('Players updated via WebSocket', { count: players.length });
      }
    } catch (error) {
      console.error('[WebSocket] Error handling players update:', error);
    }
  }
}
