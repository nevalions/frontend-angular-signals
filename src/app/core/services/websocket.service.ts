import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { buildWsUrl } from '../config/api.constants';
import { GameClock } from '../../features/matches/models/gameclock.model';
import { PlayClock } from '../../features/matches/models/playclock.model';
import { MatchData } from '../../features/matches/models/match-data.model';
import { FootballEvent } from '../../features/matches/models/football-event.model';
import { MatchStats } from '../../features/matches/models/match-stats.model';
import { MatchWithDetails, Team } from '../../features/matches/models/match.model';
import { PlayerMatchWithDetails } from '../../features/matches/models/comprehensive-match.model';
import { environment } from '../../../environments/environment';

/**
 * Connection state for the WebSocket
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Comprehensive match data received from WebSocket
 * This includes all scoreboard-related data
 */
export interface ComprehensiveMatchData {
  match_data?: MatchData;
  gameclock?: GameClock;
  playclock?: PlayClock;
  scoreboard?: unknown;
  match?: unknown;
  teams?: unknown;
  players?: PlayerMatchWithDetails[];
  events?: FootballEvent[];
  statistics?: MatchStats;
  [key: string]: unknown;
}

/**
 * WebSocket message types from backend
 */
export interface WebSocketMessage {
  playclock?: PlayClock;
  gameclock?: GameClock;
  [key: string]: unknown;
}

/**
 * Signal-based WebSocket service for real-time scoreboard updates.
 *
 * Bridges RxJS WebSocket to Angular signals for reactive state management.
 * Handles connection lifecycle, auto-reconnect, and message parsing.
 *
 * @example
 * ```typescript
 * // In a component
 * private wsService = inject(WebSocketService);
 *
 * ngOnInit() {
 *   this.wsService.connect(matchId);
 * }
 *
 * // Access data via signals
 * gameClock = computed(() => this.wsService.gameClock());
 * playClock = computed(() => this.wsService.playClock());
 * matchData = computed(() => this.wsService.matchData());
 * statistics = computed(() => this.wsService.statistics());
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private destroyRef = inject(DestroyRef);

  private readonly enableDebugLogging = false;

  // WebSocket subject and state
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private currentMatchId: number | null = null;
  private readonly clientId: string;

  // Reconnection configuration
  private readonly maxRetryAttempts = 3;
  private readonly initialRetryDelay = 3000;
  private retryAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;

  // Connection state signal
  readonly connectionState = signal<ConnectionState>('disconnected');

  // Data signals
  readonly matchData = signal<ComprehensiveMatchData | null>(null);
  readonly gameClock = signal<GameClock | null>(null);
  readonly playClock = signal<PlayClock | null>(null);
  readonly events = signal<FootballEvent[]>([]);
  readonly statistics = signal<MatchStats | null>(null);
  readonly lastEventUpdate = signal<number | null>(null);
  readonly lastStatsUpdate = signal<number | null>(null);
  
  // Partial update signals (for incremental updates from match-update messages)
  readonly matchDataPartial = signal<MatchData | null>(null);
  readonly scoreboardPartial = signal<unknown | null>(null);
  readonly matchPartial = signal<MatchWithDetails | null>(null);
  readonly teamsPartial = signal<{team_a: Team; team_b: Team} | null>(null);
  readonly playersPartial = signal<PlayerMatchWithDetails[] | null>(null);
  readonly eventsPartial = signal<FootballEvent[] | null>(null);

  readonly lastMatchDataUpdate = signal<number | null>(null);
  readonly lastMatchUpdate = signal<number | null>(null);
  readonly lastTeamsUpdate = signal<number | null>(null);
  readonly lastPlayersUpdate = signal<number | null>(null);
  readonly lastEventsUpdate = signal<number | null>(null);

  // Error signal for debugging
  readonly lastError = signal<string | null>(null);

  // Connection health monitoring
  readonly lastPingReceived = signal<number | null>(null);
  readonly connectionHealthy = computed(() => {
    const lastPing = this.lastPingReceived();
    if (!lastPing) return true;
    return Date.now() - lastPing < 60000;
  });

  readonly lastRtt = signal<number | null>(null);
  readonly connectionQuality = computed<'good' | 'fair' | 'poor' | 'unknown'>(() => {
    const rtt = this.lastRtt();
    if (rtt === null) return 'unknown';
    if (rtt < 100) return 'good';
    if (rtt < 300) return 'fair';
    return 'poor';
  });

  constructor() {
    this.clientId = this.generateUUID();

    // Cleanup on service destroy
    this.destroyRef.onDestroy(() => {
      this.disconnect();
    });
  }

  private log(...args: unknown[]): void {
    if (this.enableDebugLogging && !environment.production) {
      console.log('[WebSocket]', new Date().toISOString(), ...args);
    }
  }

  private debugLog(...args: unknown[]): void {
    if (this.enableDebugLogging) {
      console.log(...args);
    }
  }

  private logClock(type: 'gameclock' | 'playclock', action: string, data: unknown): void {
    if (this.enableDebugLogging) {
      console.log(`[WebSocket][${type.toUpperCase()}]`, new Date().toISOString(), action, JSON.stringify(data, null, 2));
    }
  }

  private warn(...args: unknown[]): void {
    console.warn('[WebSocket]', ...args);
  }

  /**
   * Connect to WebSocket for a specific match
   *
   * @param matchId - The match ID to connect to
   * @param isReconnect - Whether this is a reconnection attempt (internal use)
   */
  connect(matchId: number, isReconnect = false): void {
    // If already connected to the same match, skip
    if (this.socket$ && this.currentMatchId === matchId && this.connectionState() === 'connected') {
      this.log('Already connected to match', matchId);
      return;
    }

    // If connecting to a different match, reset clock signals
    if (this.currentMatchId !== null && this.currentMatchId !== matchId) {
      this.resetClockSignals();
      this.disconnect();
    }

    // Only reset retry count on fresh connections, not reconnects
    if (!isReconnect) {
      this.retryAttempt = 0;
      this.intentionalDisconnect = false;
    }

    // Clear any existing socket without resetting state
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    this.currentMatchId = matchId;
    this.connectionState.set('connecting');

    const wsUrl = buildWsUrl(`/api/matches/ws/id/${matchId}/${this.clientId}/`);
    this.log('Connecting to', wsUrl);

    try {
      this.socket$ = webSocket<WebSocketMessage>({
        url: wsUrl,
        openObserver: {
          next: () => {
            this.log('Connection established');
            this.connectionState.set('connected');
            this.retryAttempt = 0;
            this.lastError.set(null);
          },
        },
        closeObserver: {
          next: (event) => {
            this.log('Connection closed', event);
            if (this.connectionState() !== 'disconnected') {
              this.handleDisconnect();
            }
          },
        },
      });

      this.socket$
        .pipe(
          tap((message) => this.handleMessage(message)),
          catchError((error) => {
            console.error('[WebSocket] Error:', error);
            this.lastError.set(error?.message || 'WebSocket error');
            this.handleDisconnect();
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe();
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      this.connectionState.set('error');
      this.lastError.set('Failed to create WebSocket connection');
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.log('Disconnecting');

    // Mark as intentional to prevent reconnect attempts
    this.intentionalDisconnect = true;

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close socket
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    // Reset state
    this.currentMatchId = null;
    this.connectionState.set('disconnected');
    this.retryAttempt = 0;
  }

  /**
   * Send a message through the WebSocket
   *
   * @param message - The message to send (will be JSON stringified)
   */
  sendMessage(message: unknown): void {
    if (!this.socket$ || this.connectionState() !== 'connected') {
      this.warn('Cannot send message - not connected');
      return;
    }

    this.log('Sending message:', message);
    this.socket$.next(message as WebSocketMessage);
  }

  /**
   * Reset all data signals to null
   */
  resetData(): void {
    this.matchData.set(null);
    this.gameClock.set(null);
    this.playClock.set(null);
    this.events.set([]);
    this.statistics.set(null);
    this.lastEventUpdate.set(null);
    this.lastStatsUpdate.set(null);
  }

  /**
   * Clear clock-specific signals when switching matches
   */
  private resetClockSignals(): void {
    this.gameClock.set(null);
    this.playClock.set(null);
  }

  /**
   * Handle incoming WebSocket messages and update appropriate signals
   */
  private handleMessage(message: WebSocketMessage): void {
    this.log('Message received:', JSON.stringify(message, null, 2));

    const messageType = message['type'] as string | undefined;
    this.debugLog('[WebSocket][DEBUG] Message type:', messageType, 'Keys in message:', Object.keys(message));

    const data = message['data'] as Record<string, unknown> | undefined;
    if (data) {
      this.debugLog('[WebSocket][DEBUG] Data keys:', Object.keys(data));
    }

    // Handle ping messages
    if (messageType === 'ping') {
      this.handlePing(message);
      return;
    }

    // Handle playclock updates
    if (messageType === 'playclock-update' || ('playclock' in message && message.playclock !== undefined && !('data' in message))) {
      this.logClock('playclock', 'RECEIVED playclock-update message', { messageType, hasPlayclock: 'playclock' in message });
      const playclock = (message.playclock ?? (data?.['playclock'] as PlayClock | undefined)) ?? null;
      this.logClock('playclock', 'Extracted playclock data', playclock);
      if (playclock !== undefined) {
        if (playclock === null) {
          this.playClock.set(null);
          this.logClock('playclock', 'Signal set to null', null);
        } else {
          const currentPlayClock = this.playClock();
          this.logClock('playclock', 'Current playClock before merge', currentPlayClock);
          const merged = this.mergePlayClock(playclock);
          this.logClock('playclock', 'Merged playClock to set', merged);
          this.playClock.set(merged);
          this.logClock('playclock', 'Signal updated, new value', this.playClock());
        }
      } else {
        this.logClock('playclock', 'SKIPPED - no playclock data extracted', null);
      }
      return;
    }

    // Handle gameclock updates
    if (messageType === 'gameclock-update' || ('gameclock' in message && message.gameclock !== undefined && !('data' in message))) {
      this.logClock('gameclock', 'RECEIVED gameclock-update message', { messageType, hasGameclock: 'gameclock' in message });
      const gameclock = (message.gameclock ?? (data?.['gameclock'] as GameClock | undefined)) ?? null;
      this.logClock('gameclock', 'Extracted gameclock data', gameclock);
      if (gameclock !== undefined) {
        const messageMatchId = message['match_id'] as number | undefined;
        if (this.currentMatchId === messageMatchId) {
          if (gameclock === null) {
            this.gameClock.set(null);
            this.logClock('gameclock', 'Signal set to null', null);
          } else {
            const currentGameClock = this.gameClock();
            this.logClock('gameclock', 'Current gameClock before merge', currentGameClock);
            const merged = this.mergeGameClock(gameclock);
            this.logClock('gameclock', 'Merged gameClock to set', merged);
            this.gameClock.set(merged);
            this.logClock('gameclock', 'Signal updated, new value', this.gameClock());
          }
        } else {
          this.logClock('gameclock', 'Skipping gameclock update for different match: messageMatchId=' + messageMatchId + ', currentMatchId=' + this.currentMatchId, null);
        }
      } else {
        this.logClock('gameclock', 'SKIPPED - no gameclock data extracted', null);
      }
      return;
    }

    // Handle event updates
    if (messageType === 'event-update') {
      this.handleEventUpdate(message);
      return;
    }

    // Handle statistics updates
    if (messageType === 'statistics-update') {
      this.handleStatisticsUpdate(message);
      return;
    }

    // Handle players updates
    if (messageType === 'players-update') {
      this.handlePlayersUpdate(message);
      return;
    }

    // Handle initial-load message (combined full data on connection)
    if (messageType === 'initial-load') {
      const data = message['data'] as Record<string, unknown> | undefined;
      if (data) {
        const matchData: ComprehensiveMatchData = {
          match_data: data['match_data'] as MatchData | undefined,
          scoreboard: data['scoreboard_data'],
          match: data['match'] as unknown,
          teams: data['teams_data'] as unknown,
          gameclock: data['gameclock'] as GameClock | undefined,
          playclock: data['playclock'] as PlayClock | undefined,
          events: data['events'] as FootballEvent[] | undefined,
          // Set players separately if provided, otherwise initialize with empty array
          players: (data['players'] as PlayerMatchWithDetails[] | undefined) || [],
        };

        // Set match data signal
        this.matchData.set(matchData);

        // Set clock signals separately (for predictor sync)
        if (matchData.gameclock) {
          this.gameClock.set(this.mergeGameClock(matchData.gameclock));
        }
        if (matchData.playclock) {
          this.playClock.set(this.mergePlayClock(matchData.playclock));
        }

        const scoreboardData = data['scoreboard_data'];
        if (scoreboardData) {
          this.scoreboardPartial.set(scoreboardData);
        }

        const players = data['players'] as PlayerMatchWithDetails[] | undefined;
        if (players) {
          this.playersPartial.set(players);
          this.lastPlayersUpdate.set(Date.now());
        }

        // Set events and stats
        if (matchData.events) {
          this.events.set(matchData.events);
          this.lastEventUpdate.set(Date.now());
        }
        const stats = data['statistics'] as MatchStats | undefined;
        if (stats) {
          this.statistics.set(stats);
          this.lastStatsUpdate.set(Date.now());
        }

        this.log('Initial load data received via WebSocket', {
          hasMatch: !!matchData['match'],
          hasTeams: !!matchData['teams'],
          hasScoreboard: !!matchData.scoreboard,
          hasEvents: !!matchData.events,
          hasStats: !!stats
        });
      }
      return;
    }

    // Handle match data updates (message-update or match-update)
    if (messageType === 'message-update' || messageType === 'match-update') {
      this.log('Match data update');
      // Backend sends data wrapped in 'data' property
      if (data) {
        // Check if match_data fields are directly in data (not nested)
        const hasMatchDataFields = [
          'score_team_a', 'score_team_b', 'qtr', 'down', 'distance',
          'ball_on', 'timeout_team_a', 'timeout_team_b', 'field_length', 'game_status'
        ].some(field => field in data);

        if (hasMatchDataFields) {
          this.matchDataPartial.set(data as unknown as MatchData);
          this.lastMatchDataUpdate.set(Date.now());
        } else {
          // Set partial update signals (don't overwrite matchData signal)
          const matchData = data['match_data'] as MatchData | undefined;
          if (matchData) {
            this.matchDataPartial.set(matchData);
            this.lastMatchDataUpdate.set(Date.now());
          }
        }

        const scoreboardData = data['scoreboard_data'];
        if (scoreboardData) {
          this.scoreboardPartial.set(scoreboardData);
        }

        const match = data['match'] as MatchWithDetails | undefined;
        if (match) {
          this.matchPartial.set(match);
          this.lastMatchUpdate.set(Date.now());
        }

        const teams = data['teams_data'] as {team_a: Team; team_b: Team} | undefined;
        if (teams) {
          this.teamsPartial.set(teams);
          this.lastTeamsUpdate.set(Date.now());
        }

        const players = data['players'] as PlayerMatchWithDetails[] | undefined;
        if (players) {
          this.playersPartial.set(players);
          this.lastPlayersUpdate.set(Date.now());
        }

        const events = data['events'] as FootballEvent[] | undefined;
        if (events) {
          this.eventsPartial.set(events);
          this.lastEventsUpdate.set(Date.now());
        }

        // Keep clock updates for predictor sync
        const gameclock = data['gameclock'] as GameClock | undefined;
        if (gameclock !== undefined) {
          if (gameclock === null) {
            this.gameClock.set(null);
          } else {
            this.gameClock.set(this.mergeGameClock(gameclock));
          }
        }

        const playclock = data['playclock'] as PlayClock | undefined;
        if (playclock !== undefined) {
          if (playclock === null) {
            this.playClock.set(null);
          } else {
            this.playClock.set(this.mergePlayClock(playclock));
          }
        }
      }
      return;
    }

    // Fallback: try to use message directly
    this.log('Unknown message type, using as-is');
    this.matchData.set(message as ComprehensiveMatchData);
  }

  /**
   * Handle ping messages from server
   */
  private handlePing(message: WebSocketMessage): void {
    const serverTimestamp = message['timestamp'] as number;
    this.log('Received ping, sending pong');

    const now = Date.now() / 1000;

    this.sendMessage({
      type: 'pong',
      timestamp: serverTimestamp,
    });

    this.lastPingReceived.set(Date.now());

    if (serverTimestamp) {
      const rtt = (now - serverTimestamp) * 1000;
      this.lastRtt.set(rtt);
    }
  }

  /**
   * Handle event-update messages from server
   */
  private handleEventUpdate(message: WebSocketMessage): void {
    try {
      const events = message['events'] as FootballEvent[] | undefined;
      const matchId = message['match_id'] as number | undefined;

      this.log(`Received ${events?.length ?? 0} events for match ${matchId}`);

      if (events) {
        this.events.set(events);
        this.lastEventUpdate.set(Date.now());
        this.log('Events updated via WebSocket', { count: events.length });
      }
    } catch (error) {
      console.error('[WebSocket] Error handling event update:', error);
    }
  }

  /**
   * Handle statistics-update messages from server
   */
  private handleStatisticsUpdate(message: WebSocketMessage): void {
    try {
      const stats = message['statistics'] as MatchStats | undefined;
      const matchId = message['match_id'] as number | undefined;

      this.log(`Received statistics for match ${matchId}`);

      if (stats) {
        this.statistics.set(stats);
        this.lastStatsUpdate.set(Date.now());
        this.log('Statistics updated via WebSocket');
      }
    } catch (error) {
      console.error('[WebSocket] Error handling statistics update:', error);
    }
  }

  /**
   * Handle players-update messages from server
   */
  private handlePlayersUpdate(message: WebSocketMessage): void {
    try {
      const data = message['data'] as Record<string, unknown> | undefined;
      const players = data?.['players'] as PlayerMatchWithDetails[] | undefined;
      const matchId = data?.['match_id'] as number | undefined;

      this.log(`Received ${players?.length ?? 0} players for match ${matchId}`);

      if (players) {
        this.playersPartial.set(players);
        this.lastPlayersUpdate.set(Date.now());
        this.log('Players updated via WebSocket', { count: players.length });
      }
    } catch (error) {
      console.error('[WebSocket] Error handling players update:', error);
    }
  }

  /**
   * Handle disconnection and attempt reconnect if appropriate
   */
  private handleDisconnect(): void {
    if (this.connectionState() === 'disconnected' || this.intentionalDisconnect) {
      return;
    }

    this.connectionState.set('error');

    // Attempt reconnect if we haven't exceeded max attempts
    if (this.retryAttempt < this.maxRetryAttempts && this.currentMatchId) {
      this.scheduleReconnect();
    } else {
      this.log('Max retry attempts reached, giving up');
      this.connectionState.set('disconnected');
      this.currentMatchId = null;
    }
  }

  private mergePlayClock(update: PlayClock): PlayClock {
    const current = this.playClock();
    if (!current) {
      return update;
    }

    if (!this.isUpdateNewer(current, update)) {
      return current;
    }

    return {
      ...current,
      ...update,
      id: update.id ?? current.id,
      match_id: update.match_id ?? current.match_id,
    };
  }

  private mergeGameClock(update: GameClock): GameClock {
    const current = this.gameClock();
    if (!current) {
      return update;
    }

    if (!this.isUpdateNewer(current, update)) {
      return current;
    }

    return {
      ...current,
      ...update,
      id: update.id ?? current.id,
      match_id: update.match_id ?? current.match_id,
    };
  }

  private isUpdateNewer(current: GameClock | PlayClock, update: GameClock | PlayClock): boolean {
    const updateStatus = this.getClockStatus(update);
    const currentStatus = this.getClockStatus(current);

    if (updateStatus !== null && updateStatus !== currentStatus) {
      return true;
    }

    const updateVersion = update.version ?? null;
    const currentVersion = current.version ?? null;

    if (updateVersion !== null && currentVersion !== null) {
      if (updateVersion > currentVersion) {
        return true;
      }
      if (updateVersion < currentVersion) {
        return false;
      }
      // Versions are equal, use timestamp as tiebreaker
    }

    // Fallback to timestamp comparison for equal/missing versions
    const updateTimestamp = update.updated_at ? Date.parse(update.updated_at) : Number.NaN;
    const currentTimestamp = current.updated_at ? Date.parse(current.updated_at) : Number.NaN;

    if (Number.isNaN(updateTimestamp) && Number.isNaN(currentTimestamp)) {
      return true;
    }

    if (Number.isNaN(updateTimestamp)) {
      return false;
    }

    if (Number.isNaN(currentTimestamp)) {
      return true;
    }

    return updateTimestamp > currentTimestamp;
  }

  private getClockStatus(clock: GameClock | PlayClock): string | null {
    if ('gameclock_status' in clock) {
      return clock.gameclock_status ?? null;
    }

    return 'playclock_status' in clock ? clock.playclock_status ?? null : null;
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.currentMatchId) {
      return;
    }

    this.retryAttempt++;
    const backoffDelay = this.initialRetryDelay * Math.pow(1.5, this.retryAttempt - 1);
    const jitter = Math.random() * 1000;
    const delay = Math.min(backoffDelay + jitter, 30000); // Cap at 30 seconds

    this.log(`Scheduling reconnect attempt ${this.retryAttempt}/${this.maxRetryAttempts} in ${Math.round(delay)}ms`);

    const matchIdToReconnect = this.currentMatchId;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (matchIdToReconnect && this.currentMatchId === matchIdToReconnect && this.connectionState() !== 'connected') {
        this.log('Attempting reconnect...');
        this.connect(matchIdToReconnect, true); // Pass true to indicate reconnect
      }
    }, delay);
  }

  /**
   * Generate a UUID v4 for client identification
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
