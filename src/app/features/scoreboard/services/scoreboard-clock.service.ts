import { computed, effect, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { ScoreboardStoreService } from './scoreboard-store.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { GameClock, GameClockUpdate } from '../../matches/models/gameclock.model';
import { PlayClock } from '../../matches/models/playclock.model';
import { ClockPredictor } from '../utils/clock-predictor';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardClockService implements OnDestroy {
  private scoreboardStore = inject(ScoreboardStoreService);
  private wsService = inject(WebSocketService);

  private readonly enableDebugLogging = false;

  private debugLog(...args: unknown[]): void {
    if (this.enableDebugLogging) {
      console.log(...args);
    }
  }

  readonly gameClock = signal<GameClock | null>(null);
  readonly playClock = signal<PlayClock | null>(null);

  readonly gameClockSeconds = computed(() => this.gameClock()?.gameclock ?? 0);
  readonly playClockSeconds = computed(() => this.playClock()?.playclock ?? null);

  readonly predictedGameClock = signal<number>(0);
  readonly predictedPlayClock = signal<number>(0);

  private readonly gameClockLockUntil = signal(0);
  private readonly playClockLockUntil = signal(0);
  private gameClockLockTimer: ReturnType<typeof setTimeout> | null = null;
  private playClockLockTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly actionLockMs = 500;

  private clampClockValue(value: number, max?: number): number {
    const clamped = Math.max(0, value);
    return max != null ? Math.min(max, clamped) : clamped;
  }

  private gameClockPredictor: ClockPredictor;
  private playClockPredictor: ClockPredictor;

  constructor() {
    this.gameClockPredictor = new ClockPredictor(
      (value) => this.predictedGameClock.set(value)
    );
    this.playClockPredictor = new ClockPredictor(
      (value) => {
        // Log only when value changes significantly (every second)
        const current = this.predictedPlayClock();
        if (current !== value) {
          this.debugLog('[ClockService] predictedPlayClock signal updated:', current, '->', value);
        }
        this.predictedPlayClock.set(value);
      }
    );
  }

  readonly gameClockActionLocked = computed(() => this.isLocked(this.gameClockLockUntil()));
  readonly playClockActionLocked = computed(() => this.isLocked(this.playClockLockUntil()));

  private wsGameClockEffect = effect(() => {
    const clock = this.wsService.gameClock();
    if (!clock) return;

    const current = untracked(() => this.gameClock());
    
    if (current && clock.version != null && current.version != null 
        && clock.version < current.version) {
      this.debugLog('[ClockService] Skipping older version:', clock.version);
      return;
    }

    this.gameClock.set(clock);

    const rtt = this.wsService.lastRtt() ?? 100;
    const maxSeconds = clock.gameclock_max;
    this.gameClockPredictor.sync({
      gameclock: clock.gameclock ?? 0,
      gameclock_max: maxSeconds ?? 0,
      started_at_ms: clock.started_at_ms ?? null,
      server_time_ms: clock.server_time_ms ?? null,
      status: clock.gameclock_status ?? 'stopped',
      direction: clock.direction ?? 'down',
      rttMs: rtt,
    });
  });

  private wsPlayClockEffect = effect(() => {
    const clock = this.wsService.playClock();
    if (!clock) return;

    const current = untracked(() => this.playClock());
    
    if (current && clock.version != null && current.version != null 
        && clock.version < current.version) {
      this.debugLog('[ClockService] Skipping older version:', clock.version);
      return;
    }

    this.playClock.set(clock);

    const rtt = this.wsService.lastRtt() ?? 100;
    this.playClockPredictor.sync({
      gameclock: clock.playclock ?? 0,
      gameclock_max: clock.playclock_max ?? 40,
      started_at_ms: clock.started_at_ms ?? null,
      server_time_ms: clock.server_time_ms ?? null,
      status: clock.playclock_status ?? 'stopped',
      rttMs: rtt,
    });
  });

  load(matchId: number): void {
    this.scoreboardStore.getGameClock(matchId).subscribe({
      next: (clock) => this.gameClock.set(clock),
      error: () => console.error('Failed to load game clock'),
    });

    this.scoreboardStore.getPlayClock(matchId).subscribe({
      next: (clock) => this.playClock.set(clock),
      error: () => console.error('Failed to load play clock'),
    });
  }

  startGameClock(): void {
    const gc = this.gameClock();
    this.debugLog('[ClockService][ACTION] startGameClock called, current gc:', JSON.stringify(gc, null, 2));
    if (!gc) {
      this.debugLog('[ClockService][ACTION] startGameClock ABORTED - no gameClock');
      return;
    }

    this.applyGameClockUpdate({ gameclock_status: 'running' });
    this.debugLog('[ClockService][ACTION] startGameClock - calling API for gc.id:', gc.id);
    this.scoreboardStore.startGameClock(gc.id).subscribe({
      next: (updated) => {
        this.debugLog('[ClockService][ACTION] startGameClock API response:', JSON.stringify(updated, null, 2));
        const current = this.gameClock();
        if (current) {
          const merged = this.mergeGameClock(current, updated);
          this.debugLog('[ClockService][ACTION] startGameClock merged result:', JSON.stringify(merged, null, 2));
          this.gameClock.set(merged);

          const rtt = this.wsService.lastRtt() ?? 100;
          const maxSeconds = merged.gameclock_max;
          this.gameClockPredictor.sync({
            gameclock: merged.gameclock ?? 0,
            gameclock_max: maxSeconds ?? 0,
            started_at_ms: merged.started_at_ms ?? null,
            server_time_ms: merged.server_time_ms ?? null,
            status: merged.gameclock_status ?? 'stopped',
            direction: merged.direction ?? 'down',
            rttMs: rtt,
          });
        }
      },
      error: (err) => console.error('[ClockService][ACTION] startGameClock API error:', err),
    });
  }

  pauseGameClock(): void {
    const gc = this.gameClock();
    if (!gc) return;

    const currentPredicted = this.predictedGameClock();
    this.applyGameClockUpdate({
      gameclock_status: 'paused',
      gameclock: currentPredicted,
      started_at_ms: null,
    });

    this.scoreboardStore.pauseGameClock(gc.id).subscribe({
      next: (updated) => {
        const current = this.gameClock();
        if (current) {
          const merged = this.mergeGameClock(current, updated);
          this.gameClock.set(merged);

          const rtt = this.wsService.lastRtt() ?? 100;
          const maxSeconds = merged.gameclock_max;
          this.gameClockPredictor.sync({
            gameclock: merged.gameclock ?? 0,
            gameclock_max: maxSeconds ?? 0,
            started_at_ms: merged.started_at_ms ?? null,
            server_time_ms: merged.server_time_ms ?? null,
            status: merged.gameclock_status ?? 'stopped',
            direction: merged.direction ?? 'down',
            rttMs: rtt,
          });
        }
      },
      error: (err) => console.error('[ClockService] pauseGameClock API error:', err),
    });
  }

  resetGameClock(): void {
    const gc = this.gameClock();
    this.debugLog('[ClockService][ACTION] resetGameClock called, current gc:', JSON.stringify(gc, null, 2));
    if (!gc) {
      this.debugLog('[ClockService][ACTION] resetGameClock ABORTED - no gameClock');
      return;
    }

    if (gc.gameclock_max == null) {
      console.error('[ClockService][ACTION] resetGameClock - gameclock_max is null/undefined. Cannot reset without knowing max time. Backend should provide gameclock_max based on sport configuration.');
      this.debugLog('[ClockService][ACTION] resetGameClock ABORTED - no gameclock_max');
      return;
    }

    const resetValue = gc.direction === 'up' ? 0 : gc.gameclock_max;
    this.debugLog('[ClockService][ACTION] resetGameClock - direction:', gc.direction, 'resetValue:', resetValue);
    this.applyGameClockUpdate({
      gameclock_status: 'stopped',
      gameclock: resetValue,
    });

    this.debugLog('[ClockService][ACTION] resetGameClock - calling API for gc.id:', gc.id, 'resetValue:', resetValue);
    this.scoreboardStore.resetGameClock(gc.id, resetValue).subscribe({
      next: (updated) => {
        this.debugLog('[ClockService][ACTION] resetGameClock API response:', JSON.stringify(updated, null, 2));
        const current = this.gameClock();
        if (current) {
          const merged = this.mergeGameClock(current, updated);
          this.debugLog('[ClockService][ACTION] resetGameClock merged result:', JSON.stringify(merged, null, 2));
          this.gameClock.set(merged);

          const rtt = this.wsService.lastRtt() ?? 100;
          const maxSeconds = merged.gameclock_max;
          this.gameClockPredictor.sync({
            gameclock: merged.gameclock ?? 0,
            gameclock_max: maxSeconds ?? 0,
            started_at_ms: merged.started_at_ms ?? null,
            server_time_ms: merged.server_time_ms ?? null,
            status: merged.gameclock_status ?? 'stopped',
            direction: merged.direction ?? 'down',
            rttMs: rtt,
          });
        }
      },
      error: (err) => console.error('[ClockService][ACTION] resetGameClock API error:', err),
    });
  }

  updateGameClock(update: GameClockUpdate): void {
    const gc = this.gameClock();
    if (!gc) {
      this.debugLog('[ClockService][ACTION] updateGameClock ABORTED - no gameClock', update);
      return;
    }

    this.debugLog('[ClockService][ACTION] updateGameClock called, current gc:', JSON.stringify(gc, null, 2));
    this.debugLog('[ClockService][ACTION] updateGameClock payload:', JSON.stringify(update, null, 2));
    this.applyGameClockUpdate(update);
    this.debugLog('[ClockService][ACTION] updateGameClock optimistic state:', JSON.stringify(this.gameClock(), null, 2));
    this.scoreboardStore.updateGameClock(gc.id, update).subscribe({
      next: (updated) => {
        this.debugLog('[ClockService][ACTION] updateGameClock API response:', JSON.stringify(updated, null, 2));
        const current = this.gameClock();
        if (current) {
          const merged = this.mergeGameClock(current, updated);
          this.debugLog('[ClockService][ACTION] updateGameClock merged result:', JSON.stringify(merged, null, 2));
          this.gameClock.set(merged);

          const rtt = this.wsService.lastRtt() ?? 100;
          const maxSeconds = merged.gameclock_max;
          this.gameClockPredictor.sync({
            gameclock: merged.gameclock ?? 0,
            gameclock_max: maxSeconds ?? 0,
            started_at_ms: merged.started_at_ms ?? null,
            server_time_ms: merged.server_time_ms ?? null,
            status: merged.gameclock_status ?? 'stopped',
            direction: merged.direction ?? 'down',
            rttMs: rtt,
          });
        }
      },
    });
  }

  startPlayClock(seconds: number): void {
    const pc = this.playClock();
    this.debugLog('[ClockService][ACTION] startPlayClock called, seconds:', seconds, 'current pc:', JSON.stringify(pc, null, 2));
    if (!pc || pc.playclock_status === 'running') {
      this.debugLog('[ClockService][ACTION] startPlayClock ABORTED - no playClock or already running');
      return;
    }

    this.applyPlayClockUpdate({
      playclock_status: 'running',
      playclock: seconds,
    });

    const now = Date.now();
    const rtt = this.wsService.lastRtt() ?? 100;
    this.playClockPredictor.sync({
      gameclock: seconds,
      gameclock_max: seconds,
      started_at_ms: now,
      server_time_ms: now,
      status: 'running',
      rttMs: rtt,
    });

    this.debugLog('[ClockService][ACTION] startPlayClock - calling API for pc.id:', pc.id, 'seconds:', seconds);
    this.scoreboardStore.startPlayClock(pc.id, seconds).subscribe({
      next: (updated) => {
        this.debugLog('[ClockService][ACTION] startPlayClock API response:', JSON.stringify(updated, null, 2));
        const current = this.playClock();
        if (current) {
          const merged = this.mergePlayClock(current, updated);
          this.debugLog('[ClockService][ACTION] startPlayClock merged result:', JSON.stringify(merged, null, 2));
          this.playClock.set(merged);

          // Sync predictor with API response data (WebSocket may be delayed or missing fields)
          this.debugLog('[ClockService][ACTION] startPlayClock - checking predictor sync conditions:', {
            started_at_ms: merged.started_at_ms,
            playclock_status: merged.playclock_status,
            server_time_ms: merged.server_time_ms,
          });
          if (merged.started_at_ms && merged.playclock_status === 'running') {
            const rtt = this.wsService.lastRtt() ?? 100;
            this.debugLog('[ClockService][ACTION] startPlayClock - syncing predictor with API data:', {
              gameclock: merged.playclock ?? 0,
              gameclock_max: merged.playclock_max ?? seconds,
              started_at_ms: merged.started_at_ms,
              server_time_ms: merged.server_time_ms ?? null,
              status: merged.playclock_status,
              rttMs: rtt,
            });
            this.playClockPredictor.sync({
              gameclock: merged.playclock ?? 0,
              gameclock_max: merged.playclock_max ?? seconds,
              started_at_ms: merged.started_at_ms,
              server_time_ms: merged.server_time_ms ?? null,
              status: merged.playclock_status,
              rttMs: rtt,
            });
          } else {
            this.debugLog('[ClockService][ACTION] startPlayClock - NOT syncing predictor (conditions not met)');
          }
        }
      },
      error: (err) => console.error('[ClockService][ACTION] startPlayClock API error:', err),
    });
  }

  resetPlayClock(): void {
    const pc = this.playClock();
    this.debugLog('[ClockService][ACTION] resetPlayClock called, current pc:', JSON.stringify(pc, null, 2));
    if (!pc) {
      this.debugLog('[ClockService][ACTION] resetPlayClock ABORTED - no playClock');
      return;
    }

    this.applyPlayClockUpdate({
      playclock_status: 'stopped',
      playclock: 0,
    });

    this.debugLog('[ClockService][ACTION] resetPlayClock - calling API for pc.id:', pc.id);
    this.scoreboardStore.resetPlayClock(pc.id).subscribe({
      next: (updated) => {
        this.debugLog('[ClockService][ACTION] resetPlayClock API response:', JSON.stringify(updated, null, 2));
        const current = this.playClock();
        if (current) {
          const merged = this.mergePlayClock(current, updated);
          this.debugLog('[ClockService][ACTION] resetPlayClock merged result:', JSON.stringify(merged, null, 2));
          this.playClock.set(merged);
        }
      },
      error: (err) => console.error('[ClockService][ACTION] resetPlayClock API error:', err),
    });
  }

  private mergeGameClock(current: GameClock, update: GameClock | null | undefined): GameClock {
    if (!update) {
      return current;
    }

    // Don't overwrite with older version (API may return stale data)
    if (update.version != null && current.version != null && update.version < current.version) {
      return current;
    }

    return {
      ...current,
      ...update,
      id: update.id ?? current.id,
      match_id: update.match_id ?? current.match_id,
    };
  }

  private mergePlayClock(current: PlayClock, update: PlayClock | null | undefined): PlayClock {
    if (!update) {
      return current;
    }

    // Don't overwrite with older version (API may return stale data)
    if (update.version != null && current.version != null && update.version < current.version) {
      return current;
    }

    return {
      ...current,
      ...update,
      id: update.id ?? current.id,
      match_id: update.match_id ?? current.match_id,
    };
  }

  private applyGameClockUpdate(update: Partial<GameClock>): void {
    const current = this.gameClock();
    if (!current) {
      return;
    }

    this.setGameClockLock();
    const updated = {
      ...current,
      ...update,
      id: current.id,
      match_id: current.match_id,
      // Bump version for optimistic update to prevent stale API response from overwriting
      version: (current.version ?? 0) + 1,
    };
    this.gameClock.set(updated);

    // Sync predictor immediately for optimistic UI update
    const rtt = this.wsService.lastRtt() ?? 100;
    const maxSeconds = updated.gameclock_max;
    this.gameClockPredictor.sync({
      gameclock: updated.gameclock ?? 0,
      gameclock_max: maxSeconds ?? 0,
      started_at_ms: updated.started_at_ms ?? null,
      server_time_ms: updated.server_time_ms ?? null,
      status: updated.gameclock_status ?? 'stopped',
      direction: updated.direction ?? 'down',
      rttMs: rtt,
    });
  }

  private applyPlayClockUpdate(update: Partial<PlayClock>): void {
    const current = this.playClock();
    if (!current) {
      return;
    }

    this.setPlayClockLock();
    this.playClock.set({
      ...current,
      ...update,
      id: current.id,
      match_id: current.match_id,
      // Bump version for optimistic update to prevent stale API response from overwriting
      version: (current.version ?? 0) + 1,
    });
  }

  ngOnDestroy(): void {
    this.gameClockPredictor.destroy();
    this.playClockPredictor.destroy();
  }

  private isLocked(lockUntil: number): boolean {
    return lockUntil > Date.now();
  }

  private setGameClockLock(): void {
    const lockUntil = Date.now() + this.actionLockMs;
    this.gameClockLockUntil.set(lockUntil);

    if (this.gameClockLockTimer) {
      clearTimeout(this.gameClockLockTimer);
    }

    this.gameClockLockTimer = setTimeout(() => {
      this.gameClockLockUntil.set(0);
      this.gameClockLockTimer = null;
    }, this.actionLockMs);
  }

  private setPlayClockLock(): void {
    const lockUntil = Date.now() + this.actionLockMs;
    this.playClockLockUntil.set(lockUntil);

    if (this.playClockLockTimer) {
      clearTimeout(this.playClockLockTimer);
    }

    this.playClockLockTimer = setTimeout(() => {
      this.playClockLockUntil.set(0);
      this.playClockLockTimer = null;
    }, this.actionLockMs);
  }
}
