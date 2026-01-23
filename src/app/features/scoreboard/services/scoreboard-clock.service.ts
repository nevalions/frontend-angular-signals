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
    console.log('[ClockService][GAMECLOCK] Effect triggered, wsService.gameClock():', JSON.stringify(clock, null, 2));

    if (!clock) {
      console.log('[ClockService][GAMECLOCK] No clock data, skipping');
      return;
    }

    // Use untracked to read local state without creating dependencies
    // This prevents infinite loops when we set gameClock later in this effect
    const current = untracked(() => this.gameClock());
    const currentPredicted = untracked(() => this.predictedGameClock());
    console.log('[ClockService][GAMECLOCK] Current local gameClock:', JSON.stringify(current, null, 2));
    console.log('[ClockService][GAMECLOCK] Current predicted value:', currentPredicted);

    if (current && clock.version != null && current.version != null && clock.version < current.version) {
      console.log('[ClockService][GAMECLOCK] SKIPPING - incoming version', clock.version, '< current version', current.version);
      return;
    }

    // Determine what gameclock value to use
    let effectiveGameclock = clock.gameclock;

    // The backend doesn't track running time - it stores the value when clock was started.
    // On pause, it returns the start value, not the elapsed time.
    // We need to use our local predicted time in these cases:
    //
    // PAUSE SCENARIO:
    // - Incoming status is 'paused'
    // - Local status was 'paused' (from optimistic update in pauseGameClock())
    // - We have a local gameclock value that's lower than incoming (clock counts down)
    // - This means we paused while running and have the correct elapsed time locally
    //
    // RESET SCENARIO:
    // - Incoming status is 'stopped'
    // - Local status is 'stopped' (from optimistic update in resetGameClock())
    // - We should use the backend's value (which should be max time)
    
    const isLocalPaused = current?.gameclock_status === 'paused';
    const isLocalStopped = current?.gameclock_status === 'stopped';
    const localHasBetterValue = current?.gameclock != null && clock.gameclock != null && current.gameclock < clock.gameclock;
    
    // On pause: if local has a better (lower) value, use it
    // The optimistic update in pauseGameClock() sets the correct predicted time
    if (clock.gameclock_status === 'paused' && isLocalPaused && localHasBetterValue) {
      console.log('[ClockService][GAMECLOCK] PAUSE detected - using local value:', current!.gameclock, '(backend returned:', clock.gameclock, ')');
      effectiveGameclock = current!.gameclock;
    }
    
    // On reset: use backend value (should be max time)
    if (clock.gameclock_status === 'stopped' && isLocalStopped) {
      console.log('[ClockService][GAMECLOCK] RESET detected - using backend value:', clock.gameclock);
      // effectiveGameclock is already set to clock.gameclock, so no change needed
    }

    const updatedClock: GameClock = {
      ...clock,
      gameclock: effectiveGameclock,
      gameclock_time_remaining: effectiveGameclock,
    };

    console.log('[ClockService][GAMECLOCK] Setting gameClock signal with:', JSON.stringify(updatedClock, null, 2));
    this.gameClock.set(updatedClock);

    if (effectiveGameclock !== undefined && effectiveGameclock !== null && clock.gameclock_status !== undefined && clock.gameclock_status !== null) {
      console.log('[ClockService][GAMECLOCK] Syncing predictor with value:', effectiveGameclock, 'status:', clock.gameclock_status);
      this.gameClockPredictor.sync({
        value: effectiveGameclock,
        status: clock.gameclock_status,
        timestamp: clock.updated_at ? new Date(clock.updated_at).getTime() : undefined
      });
    } else {
      console.log('[ClockService][GAMECLOCK] NOT syncing predictor - missing gameclock or gameclock_status');
    }
  });

  private wsPlayClockEffect = effect(() => {
    const clock = this.wsService.playClock();
    console.log('[ClockService][PLAYCLOCK] Effect triggered, wsService.playClock():', JSON.stringify(clock, null, 2));

    if (!clock) {
      console.log('[ClockService][PLAYCLOCK] No clock data, skipping');
      return;
    }

    // Use untracked to read local state without creating dependencies
    // This prevents infinite loops when we set playClock later in this effect
    const current = untracked(() => this.playClock());
    const currentPredicted = untracked(() => this.predictedPlayClock());
    console.log('[ClockService][PLAYCLOCK] Current local playClock:', JSON.stringify(current, null, 2));
    console.log('[ClockService][PLAYCLOCK] Current predicted value:', currentPredicted);

    if (current && clock.version != null && current.version != null && clock.version < current.version) {
      console.log('[ClockService][PLAYCLOCK] SKIPPING - incoming version', clock.version, '< current version', current.version);
      return;
    }

    // Determine what playclock value to use
    let effectivePlayclock = clock.playclock;

    // If stopped and local has better value (from optimistic update), use it
    if (clock.playclock_status !== 'running' && current?.playclock != null && current.playclock > 0) {
      console.log('[ClockService][PLAYCLOCK] Using local playClock value:', current.playclock);
      effectivePlayclock = current.playclock;
    }

    const updatedClock: PlayClock = {
      ...clock,
      playclock: effectivePlayclock,
    };

    console.log('[ClockService][PLAYCLOCK] Setting playClock signal with:', JSON.stringify(updatedClock, null, 2));
    this.playClock.set(updatedClock);

    if (effectivePlayclock !== undefined && effectivePlayclock !== null && clock.playclock_status !== undefined && clock.playclock_status !== null) {
      console.log('[ClockService][PLAYCLOCK] Syncing predictor with value:', effectivePlayclock, 'status:', clock.playclock_status);
      this.playClockPredictor.sync({
        value: effectivePlayclock,
        status: clock.playclock_status,
        timestamp: clock.updated_at ? new Date(clock.updated_at).getTime() : undefined
      });
    } else {
      console.log('[ClockService][PLAYCLOCK] NOT syncing predictor - missing playclock or playclock_status');
    }
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
    console.log('[ClockService][ACTION] pauseGameClock called, current gc:', JSON.stringify(gc, null, 2));
    if (!gc) {
      console.log('[ClockService][ACTION] pauseGameClock ABORTED - no gameClock');
      return;
    }

    // Capture the current predicted time before pausing
    // This is critical because the backend doesn't track running time
    const currentPredictedTime = this.predictedGameClock();
    console.log('[ClockService][ACTION] pauseGameClock - capturing predicted time:', currentPredictedTime);

    this.applyGameClockUpdate({
      gameclock_status: 'paused',
      gameclock: currentPredictedTime,
      gameclock_time_remaining: currentPredictedTime,
    });

    console.log('[ClockService][ACTION] pauseGameClock - calling API for gc.id:', gc.id);
    this.scoreboardStore.pauseGameClock(gc.id).subscribe({
      next: (updated) => {
        console.log('[ClockService][ACTION] pauseGameClock API response:', JSON.stringify(updated, null, 2));
        // Preserve our local predicted time since backend doesn't track it properly
        const current = this.gameClock();
        if (current) {
          // Override the backend's gameclock value with our locally tracked value
          const mergedWithLocalTime = this.mergeGameClock(current, {
            ...updated,
            gameclock: current.gameclock, // Keep local value
            gameclock_time_remaining: current.gameclock_time_remaining, // Keep local value
          });
          console.log('[ClockService][ACTION] pauseGameClock merged result (with local time preserved):', JSON.stringify(mergedWithLocalTime, null, 2));
          this.gameClock.set(mergedWithLocalTime);
        }
      },
      error: (err) => console.error('[ClockService][ACTION] pauseGameClock API error:', err),
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
