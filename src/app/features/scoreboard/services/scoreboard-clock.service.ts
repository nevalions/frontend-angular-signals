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

  private gameClockPredictor: ClockPredictor;
  private playClockPredictor: ClockPredictor;

  constructor() {
    this.gameClockPredictor = new ClockPredictor(
      (value) => this.predictedGameClock.set(value)
    );
    this.playClockPredictor = new ClockPredictor(
      (value) => this.predictedPlayClock.set(value)
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
      console.log('[ClockService] Skipping older version:', clock.version);
      return;
    }

    this.gameClock.set(clock);

    const rtt = this.wsService.lastRtt() ?? 100;
    this.gameClockPredictor.sync({
      gameclock: clock.gameclock ?? 0,
      gameclock_max: clock.gameclock_max ?? 720,
      started_at_ms: clock.started_at_ms ?? null,
      server_time_ms: clock.server_time_ms ?? null,
      status: clock.gameclock_status ?? 'stopped',
      rttMs: rtt,
    });
  });

  private wsPlayClockEffect = effect(() => {
    const clock = this.wsService.playClock();
    if (!clock) return;

    const current = untracked(() => this.playClock());
    
    if (current && clock.version != null && current.version != null 
        && clock.version < current.version) {
      console.log('[ClockService] Skipping older version:', clock.version);
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
    console.log('[ClockService][ACTION] startGameClock called, current gc:', JSON.stringify(gc, null, 2));
    if (!gc) {
      console.log('[ClockService][ACTION] startGameClock ABORTED - no gameClock');
      return;
    }

    this.applyGameClockUpdate({ gameclock_status: 'running' });
    console.log('[ClockService][ACTION] startGameClock - calling API for gc.id:', gc.id);
    this.scoreboardStore.startGameClock(gc.id).subscribe({
      next: (updated) => {
        console.log('[ClockService][ACTION] startGameClock API response:', JSON.stringify(updated, null, 2));
        const current = this.gameClock();
        if (current) {
          const merged = this.mergeGameClock(current, updated);
          console.log('[ClockService][ACTION] startGameClock merged result:', JSON.stringify(merged, null, 2));
          this.gameClock.set(merged);
        }
      },
      error: (err) => console.error('[ClockService][ACTION] startGameClock API error:', err),
    });
  }

  pauseGameClock(): void {
    const gc = this.gameClock();
    if (!gc) return;

    this.applyGameClockUpdate({ gameclock_status: 'paused' });

    this.scoreboardStore.pauseGameClock(gc.id).subscribe({
      next: (updated) => {
        const current = this.gameClock();
        if (current) {
          this.gameClock.set(this.mergeGameClock(current, updated));
        }
      },
      error: (err) => console.error('[ClockService] pauseGameClock API error:', err),
    });
  }

  resetGameClock(): void {
    const gc = this.gameClock();
    console.log('[ClockService][ACTION] resetGameClock called, current gc:', JSON.stringify(gc, null, 2));
    if (!gc) {
      console.log('[ClockService][ACTION] resetGameClock ABORTED - no gameClock');
      return;
    }

    const maxSeconds = gc.gameclock_max ?? 720;
    if (gc.gameclock_max == null) {
      console.warn('[ClockService][ACTION] resetGameClock - gameclock_max is null/undefined, using fallback 720 seconds (12 min). Backend should provide gameclock_max based on sport configuration.');
    }
    console.log('[ClockService][ACTION] resetGameClock - maxSeconds:', maxSeconds);
    this.applyGameClockUpdate({
      gameclock_status: 'stopped',
      gameclock: maxSeconds,
    });

    console.log('[ClockService][ACTION] resetGameClock - calling API for gc.id:', gc.id, 'maxSeconds:', maxSeconds);
    this.scoreboardStore.resetGameClock(gc.id, maxSeconds).subscribe({
      next: (updated) => {
        console.log('[ClockService][ACTION] resetGameClock API response:', JSON.stringify(updated, null, 2));
        const current = this.gameClock();
        if (current) {
          const merged = this.mergeGameClock(current, updated);
          console.log('[ClockService][ACTION] resetGameClock merged result:', JSON.stringify(merged, null, 2));
          this.gameClock.set(merged);
        }
      },
      error: (err) => console.error('[ClockService][ACTION] resetGameClock API error:', err),
    });
  }

  updateGameClock(update: GameClockUpdate): void {
    const gc = this.gameClock();
    if (!gc) {
      return;
    }

    this.applyGameClockUpdate(update);
    this.scoreboardStore.updateGameClock(gc.id, update).subscribe({
      next: (updated) => {
        const current = this.gameClock();
        if (current) {
          this.gameClock.set(this.mergeGameClock(current, updated));
        }
      },
    });
  }

  startPlayClock(seconds: number): void {
    const pc = this.playClock();
    console.log('[ClockService][ACTION] startPlayClock called, seconds:', seconds, 'current pc:', JSON.stringify(pc, null, 2));
    if (!pc || pc.playclock_status === 'running') {
      console.log('[ClockService][ACTION] startPlayClock ABORTED - no playClock or already running');
      return;
    }

    this.applyPlayClockUpdate({
      playclock_status: 'running',
      playclock: seconds,
    });

    console.log('[ClockService][ACTION] startPlayClock - calling API for pc.id:', pc.id, 'seconds:', seconds);
    this.scoreboardStore.startPlayClock(pc.id, seconds).subscribe({
      next: (updated) => {
        console.log('[ClockService][ACTION] startPlayClock API response:', JSON.stringify(updated, null, 2));
        const current = this.playClock();
        if (current) {
          const merged = this.mergePlayClock(current, updated);
          console.log('[ClockService][ACTION] startPlayClock merged result:', JSON.stringify(merged, null, 2));
          this.playClock.set(merged);
        }
      },
      error: (err) => console.error('[ClockService][ACTION] startPlayClock API error:', err),
    });
  }

  resetPlayClock(): void {
    const pc = this.playClock();
    console.log('[ClockService][ACTION] resetPlayClock called, current pc:', JSON.stringify(pc, null, 2));
    if (!pc) {
      console.log('[ClockService][ACTION] resetPlayClock ABORTED - no playClock');
      return;
    }

    this.applyPlayClockUpdate({
      playclock_status: 'stopped',
      playclock: 0,
    });

    console.log('[ClockService][ACTION] resetPlayClock - calling API for pc.id:', pc.id);
    this.scoreboardStore.resetPlayClock(pc.id).subscribe({
      next: (updated) => {
        console.log('[ClockService][ACTION] resetPlayClock API response:', JSON.stringify(updated, null, 2));
        const current = this.playClock();
        if (current) {
          const merged = this.mergePlayClock(current, updated);
          console.log('[ClockService][ACTION] resetPlayClock merged result:', JSON.stringify(merged, null, 2));
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
    this.gameClock.set({
      ...current,
      ...update,
      id: current.id,
      match_id: current.match_id,
      // Bump version for optimistic update to prevent stale API response from overwriting
      version: (current.version ?? 0) + 1,
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
