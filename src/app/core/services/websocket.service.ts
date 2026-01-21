import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { buildWsUrl } from '../config/api.constants';
import { GameClock } from '../../features/matches/models/gameclock.model';
import { PlayClock } from '../../features/matches/models/playclock.model';
import { MatchData } from '../../features/matches/models/match-data.model';

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
  [key: string]: unknown;
}

/**
 * WebSocket message types from backend
 */
interface WebSocketMessage {
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
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private destroyRef = inject(DestroyRef);

  // WebSocket subject and state
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private currentMatchId: number | null = null;
  private readonly clientId: string;
  private closing$ = new Subject<void>();

  // Reconnection configuration
  private readonly maxRetryAttempts = 10;
  private readonly initialRetryDelay = 2000;
  private retryAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // Connection state signal
  readonly connectionState = signal<ConnectionState>('disconnected');

  // Data signals
  readonly matchData = signal<ComprehensiveMatchData | null>(null);
  readonly gameClock = signal<GameClock | null>(null);
  readonly playClock = signal<PlayClock | null>(null);

  // Error signal for debugging
  readonly lastError = signal<string | null>(null);

  constructor() {
    this.clientId = this.generateUUID();

    // Cleanup on service destroy
    this.destroyRef.onDestroy(() => {
      this.disconnect();
    });
  }

  /**
   * Connect to WebSocket for a specific match
   *
   * @param matchId - The match ID to connect to
   */
  connect(matchId: number): void {
    // If already connected to the same match, skip
    if (this.socket$ && this.currentMatchId === matchId && this.connectionState() === 'connected') {
      console.log('[WebSocket] Already connected to match', matchId);
      return;
    }

    // Disconnect from any existing connection
    this.disconnect();

    this.currentMatchId = matchId;
    this.connectionState.set('connecting');
    this.retryAttempt = 0;

    const wsUrl = buildWsUrl(`/match/${matchId}/${this.clientId}/`);
    console.log('[WebSocket] Connecting to', wsUrl);

    try {
      this.socket$ = webSocket<WebSocketMessage>({
        url: wsUrl,
        openObserver: {
          next: () => {
            console.log('[WebSocket] Connection established');
            this.connectionState.set('connected');
            this.retryAttempt = 0;
            this.lastError.set(null);
          },
        },
        closeObserver: {
          next: (event) => {
            console.log('[WebSocket] Connection closed', event);
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
    console.log('[WebSocket] Disconnecting');

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Signal closing
    this.closing$.next();

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
      console.warn('[WebSocket] Cannot send message - not connected');
      return;
    }

    console.log('[WebSocket] Sending message:', message);
    this.socket$.next(message as WebSocketMessage);
  }

  /**
   * Reset all data signals to null
   */
  resetData(): void {
    this.matchData.set(null);
    this.gameClock.set(null);
    this.playClock.set(null);
  }

  /**
   * Handle incoming WebSocket messages and update appropriate signals
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('[WebSocket] Message received:', message);

    // Check for specific message types
    if ('playclock' in message && message.playclock) {
      console.log('[WebSocket] Playclock update');
      this.playClock.set(message.playclock);
    } else if ('gameclock' in message && message.gameclock) {
      console.log('[WebSocket] Gameclock update');
      this.gameClock.set(message.gameclock);
    } else {
      // Comprehensive match data update
      console.log('[WebSocket] Match data update');
      this.matchData.set(message as ComprehensiveMatchData);

      // Also extract nested clock data if present
      if (message.gameclock) {
        this.gameClock.set(message.gameclock);
      }
      if (message.playclock) {
        this.playClock.set(message.playclock);
      }
    }
  }

  /**
   * Handle disconnection and attempt reconnect if appropriate
   */
  private handleDisconnect(): void {
    if (this.connectionState() === 'disconnected') {
      return;
    }

    this.connectionState.set('error');

    // Attempt reconnect if we haven't exceeded max attempts
    if (this.retryAttempt < this.maxRetryAttempts && this.currentMatchId) {
      this.scheduleReconnect();
    } else {
      console.log('[WebSocket] Max retry attempts reached');
      this.connectionState.set('disconnected');
    }
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

    console.log(`[WebSocket] Scheduling reconnect attempt ${this.retryAttempt}/${this.maxRetryAttempts} in ${Math.round(delay)}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentMatchId && this.connectionState() !== 'connected') {
        console.log('[WebSocket] Attempting reconnect...');
        this.connect(this.currentMatchId);
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
