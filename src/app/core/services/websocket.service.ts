import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { buildWsUrl } from '../config/api.constants';
import { GameClock } from '../../features/matches/models/gameclock.model';
import { PlayClock } from '../../features/matches/models/playclock.model';
import { MatchData } from '../../features/matches/models/match-data.model';
import { FootballEvent } from '../../features/matches/models/football-event.model';
import { MatchStats } from '../../features/matches/models/match-stats.model';
import { MatchWithDetails, Team } from '../../features/matches/models/match.model';
import { PlayerMatchWithDetails } from '../../features/matches/models/comprehensive-match.model';
import { environment } from '../../../environments/environment';
import { WebSocketConnectionManager } from './websocket-connection-manager';
import { WebSocketMessageHandlers } from './websocket-message-handlers';

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

  private readonly clientId: string;
  private readonly connectionManager: WebSocketConnectionManager;
  private readonly messageHandlers: WebSocketMessageHandlers;

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

    this.connectionManager = new WebSocketConnectionManager({
      destroyRef: this.destroyRef,
      buildWsUrl,
      clientId: this.clientId,
      onMessage: (message) => this.handleMessage(message),
      log: (...args) => this.log(...args),
      warn: (...args) => this.warn(...args),
      setConnectionState: (state) => this.connectionState.set(state),
      getConnectionState: () => this.connectionState(),
      setLastError: (message) => this.lastError.set(message),
    });

    this.messageHandlers = new WebSocketMessageHandlers({
      getCurrentMatchId: () => this.connectionManager.getCurrentMatchId(),
      log: (...args) => this.log(...args),
      debugLog: (...args) => this.debugLog(...args),
      logClock: (type, action, data) => this.logClock(type, action, data),
      sendMessage: (message) => this.sendMessage(message),
      mergeGameClock: (update) => this.mergeGameClock(update),
      mergePlayClock: (update) => this.mergePlayClock(update),
      matchData: this.matchData,
      gameClock: this.gameClock,
      playClock: this.playClock,
      events: this.events,
      statistics: this.statistics,
      lastEventUpdate: this.lastEventUpdate,
      lastStatsUpdate: this.lastStatsUpdate,
      matchDataPartial: this.matchDataPartial,
      scoreboardPartial: this.scoreboardPartial,
      matchPartial: this.matchPartial,
      teamsPartial: this.teamsPartial,
      playersPartial: this.playersPartial,
      eventsPartial: this.eventsPartial,
      lastMatchDataUpdate: this.lastMatchDataUpdate,
      lastMatchUpdate: this.lastMatchUpdate,
      lastTeamsUpdate: this.lastTeamsUpdate,
      lastPlayersUpdate: this.lastPlayersUpdate,
      lastEventsUpdate: this.lastEventsUpdate,
      lastPingReceived: this.lastPingReceived,
      lastRtt: this.lastRtt,
    });

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
    const currentMatchId = this.connectionManager.getCurrentMatchId();
    if (currentMatchId !== null && currentMatchId !== matchId) {
      this.resetClockSignals();
      this.disconnect();
    }
    if (!isReconnect) {
      this.resetData();
    }
    this.connectionManager.connect(matchId, isReconnect);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.connectionManager.disconnect();
  }

  /**
   * Send a message through the WebSocket
   *
   * @param message - The message to send (will be JSON stringified)
   */
  sendMessage(message: unknown): void {
    this.connectionManager.sendMessage(message);
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
    this.messageHandlers.handleMessage(message);
  }

  /**
   * Handle ping messages from server
   */
  private handlePing(message: WebSocketMessage): void {
    this.messageHandlers.handlePing(message);
  }

  /**
   * Handle event-update messages from server
   */
  private handleEventUpdate(message: WebSocketMessage): void {
    this.messageHandlers.handleEventUpdate(message);
  }

  /**
   * Handle statistics-update messages from server
   */
  private handleStatisticsUpdate(message: WebSocketMessage): void {
    this.messageHandlers.handleStatisticsUpdate(message);
  }

  /**
   * Handle players-update messages from server
   */
  private handlePlayersUpdate(message: WebSocketMessage): void {
    this.messageHandlers.handlePlayersUpdate(message);
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
