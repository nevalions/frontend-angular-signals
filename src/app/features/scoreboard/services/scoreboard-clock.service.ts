import { computed, effect, inject, Injectable, OnDestroy, signal } from '@angular/core';
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
    if (!clock) {
      return;
    }

    this.gameClock.set(clock);

    if (clock.gameclock !== undefined && clock.gameclock !== null && clock.gameclock_status !== undefined && clock.gameclock_status !== null) {
      this.gameClockPredictor.sync({
        value: clock.gameclock,
        status: clock.gameclock_status,
        timestamp: clock.updated_at ? new Date(clock.updated_at).getTime() : undefined
      });
    }
  });

  private wsPlayClockEffect = effect(() => {
    const clock = this.wsService.playClock();
    if (!clock) {
      return;
    }

    this.playClock.set(clock);

    if (clock.playclock !== undefined && clock.playclock !== null && clock.playclock_status !== undefined && clock.playclock_status !== null) {
      this.playClockPredictor.sync({
        value: clock.playclock,
        status: clock.playclock_status,
        timestamp: clock.updated_at ? new Date(clock.updated_at).getTime() : undefined
      });
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
    if (!gc) {
      return;
    }

    this.applyGameClockUpdate({ gameclock_status: 'running' });
    this.scoreboardStore.startGameClock(gc.id).subscribe({
      next: (updated) => {
        const current = this.gameClock();
        if (current) {
          this.gameClock.set(this.mergeGameClock(current, updated));
        }
      },
    });
  }

  pauseGameClock(): void {
    const gc = this.gameClock();
    if (!gc) {
      return;
    }

    this.applyGameClockUpdate({ gameclock_status: 'paused' });
    this.scoreboardStore.pauseGameClock(gc.id).subscribe({
      next: (updated) => {
        const current = this.gameClock();
        if (current) {
          this.gameClock.set(this.mergeGameClock(current, updated));
        }
      },
    });
  }

  resetGameClock(): void {
    const gc = this.gameClock();
    if (!gc) {
      return;
    }

    const maxSeconds = gc.gameclock_max ?? 720;
    this.applyGameClockUpdate({
      gameclock_status: 'stopped',
      gameclock: maxSeconds,
    });

    this.scoreboardStore.resetGameClock(gc.id, maxSeconds).subscribe({
      next: (updated) => {
        const current = this.gameClock();
        if (current) {
          this.gameClock.set(this.mergeGameClock(current, updated));
        }
      },
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
    if (!pc || pc.playclock_status === 'running') {
      return;
    }

    this.applyPlayClockUpdate({
      playclock_status: 'running',
      playclock: seconds,
    });

    this.scoreboardStore.startPlayClock(pc.id, seconds).subscribe({
      next: (updated) => {
        const current = this.playClock();
        if (current) {
          this.playClock.set(this.mergePlayClock(current, updated));
        }
      },
    });
  }

  resetPlayClock(): void {
    const pc = this.playClock();
    if (!pc) {
      return;
    }

    this.applyPlayClockUpdate({
      playclock_status: 'stopped',
      playclock: 0,
    });

    this.scoreboardStore.resetPlayClock(pc.id).subscribe({
      next: (updated) => {
        const current = this.playClock();
        if (current) {
          this.playClock.set(this.mergePlayClock(current, updated));
        }
      },
    });
  }

  private mergeGameClock(current: GameClock, update: GameClock | null | undefined): GameClock {
    if (!update) {
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
