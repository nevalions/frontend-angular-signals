import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import type { ConnectionState, WebSocketMessage } from './websocket.service';

export interface WebSocketConnectionManagerOptions {
  destroyRef: DestroyRef;
  buildWsUrl: (path: string) => string;
  clientId: string;
  onMessage: (message: WebSocketMessage) => void;
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  setConnectionState: (state: ConnectionState) => void;
  getConnectionState: () => ConnectionState;
  setLastError: (message: string | null) => void;
}

export class WebSocketConnectionManager {
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private currentMatchId: number | null = null;

  private readonly maxRetryAttempts = 3;
  private readonly initialRetryDelay = 3000;
  private retryAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;

  constructor(private readonly options: WebSocketConnectionManagerOptions) {}

  getCurrentMatchId(): number | null {
    return this.currentMatchId;
  }

  isConnectedTo(matchId: number): boolean {
    return !!this.socket$ && this.currentMatchId === matchId && this.options.getConnectionState() === 'connected';
  }

  connect(matchId: number, isReconnect = false): void {
    if (this.isConnectedTo(matchId)) {
      this.options.log('Already connected to match', matchId);
      return;
    }

    if (!isReconnect) {
      this.retryAttempt = 0;
      this.intentionalDisconnect = false;
    }

    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    this.currentMatchId = matchId;
    this.options.setConnectionState('connecting');

    const wsUrl = this.options.buildWsUrl(`/api/matches/ws/id/${matchId}/${this.options.clientId}/`);
    this.options.log('Connecting to', wsUrl);

    try {
      this.socket$ = webSocket<WebSocketMessage>({
        url: wsUrl,
        openObserver: {
          next: () => {
            this.options.log('Connection established');
            this.options.setConnectionState('connected');
            this.retryAttempt = 0;
            this.options.setLastError(null);
          },
        },
        closeObserver: {
          next: (event) => {
            this.options.log('Connection closed', event);
            if (this.options.getConnectionState() !== 'disconnected') {
              this.handleDisconnect();
            }
          },
        },
      });

      this.socket$
        .pipe(
          tap((message) => this.options.onMessage(message)),
          catchError((error) => {
            console.error('[WebSocket] Error:', error);
            this.options.setLastError(error?.message || 'WebSocket error');
            this.handleDisconnect();
            return EMPTY;
          }),
          takeUntilDestroyed(this.options.destroyRef)
        )
        .subscribe();
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      this.options.setConnectionState('error');
      this.options.setLastError('Failed to create WebSocket connection');
    }
  }

  disconnect(): void {
    this.options.log('Disconnecting');
    this.intentionalDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    this.currentMatchId = null;
    this.options.setConnectionState('disconnected');
    this.retryAttempt = 0;
  }

  sendMessage(message: unknown): void {
    if (!this.socket$ || this.options.getConnectionState() !== 'connected') {
      this.options.warn('Cannot send message - not connected');
      return;
    }

    this.options.log('Sending message:', message);
    this.socket$.next(message as WebSocketMessage);
  }

  private handleDisconnect(): void {
    if (this.options.getConnectionState() === 'disconnected' || this.intentionalDisconnect) {
      return;
    }

    this.options.setConnectionState('error');

    if (this.retryAttempt < this.maxRetryAttempts && this.currentMatchId) {
      this.scheduleReconnect();
    } else {
      this.options.log('Max retry attempts reached, giving up');
      this.options.setConnectionState('disconnected');
      this.currentMatchId = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.currentMatchId) {
      return;
    }

    this.retryAttempt++;
    const backoffDelay = this.initialRetryDelay * Math.pow(1.5, this.retryAttempt - 1);
    const jitter = Math.random() * 1000;
    const delay = Math.min(backoffDelay + jitter, 30000);

    this.options.log(`Scheduling reconnect attempt ${this.retryAttempt}/${this.maxRetryAttempts} in ${Math.round(delay)}ms`);

    const matchIdToReconnect = this.currentMatchId;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (matchIdToReconnect && this.currentMatchId === matchIdToReconnect && this.options.getConnectionState() !== 'connected') {
        this.options.log('Attempting reconnect...');
        this.connect(matchIdToReconnect, true);
      }
    }, delay);
  }
}
