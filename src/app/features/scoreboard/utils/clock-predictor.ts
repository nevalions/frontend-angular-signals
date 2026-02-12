export interface ClockState {
  status: 'running' | 'stopped' | 'paused';
  gameclockMax: number;
  startedAtMs: number | null;
  serverTimeMs: number;
  clientReceiveMs: number;
  frozenValue: number;
  rttMs: number;
  direction: 'up' | 'down';
}

export class ClockPredictor {
  private state: ClockState | null = null;
  private animationFrameId: number | null = null;
  private onTick: (value: number) => void;
  private readonly enableDebugLogging = false;

  constructor(onTick: (value: number) => void) {
    this.onTick = onTick;
  }

  private debugLog(...args: unknown[]): void {
    if (this.enableDebugLogging) {
      console.log(...args);
    }
  }

  sync(data: {
    gameclock: number;
    gameclock_max: number;
    started_at_ms: number | null;
    server_time_ms: number | null;
    status: string;
    direction?: 'up' | 'down' | null;
    rttMs?: number;
  }): void {
    const clientReceiveMs = Date.now();
    const rttMs = data.rttMs ?? 100;

    this.debugLog('[ClockPredictor] sync() called with:', JSON.stringify(data, null, 2));

    this.state = {
      status: data.status as ClockState['status'],
      gameclockMax: data.gameclock_max,
      startedAtMs: data.started_at_ms,
      serverTimeMs: data.server_time_ms ?? clientReceiveMs,
      clientReceiveMs,
      frozenValue: data.gameclock,
      rttMs,
      direction: (data.direction ?? 'down') as 'up' | 'down',
    };

    this.debugLog('[ClockPredictor] state after sync:', JSON.stringify(this.state, null, 2));
    this.debugLog('[ClockPredictor] Checking conditions: status=', this.state.status, 'startedAtMs=', this.state.startedAtMs, 'animationFrameId=', this.animationFrameId);

    if (this.state.status === 'running' && this.state.startedAtMs) {
      if (!this.animationFrameId) {
        this.debugLog('[ClockPredictor] Starting prediction...');
        this.startPrediction();
      } else {
        this.debugLog('[ClockPredictor] Prediction already running, skipping startPrediction()');
      }
    } else {
      this.debugLog('[ClockPredictor] Stopping prediction, emitting frozenValue:', this.state.frozenValue);
      this.stopPrediction();
      this.onTick(this.state.frozenValue);
    }
  }

  private startPrediction(): void {
    let tickCount = 0;
    const tick = () => {
      if (!this.state || this.state.status !== 'running' || !this.state.startedAtMs) {
        this.debugLog('[ClockPredictor] tick() early exit - state:', this.state?.status, 'startedAtMs:', this.state?.startedAtMs);
        return;
      }

      const tickStatus = this.state.status;
      const tickStartedAtMs = this.state.startedAtMs;

      const now = Date.now();
      const timeSinceReceive = now - this.state.clientReceiveMs;
      const estimatedServerNow = this.state.serverTimeMs + timeSinceReceive;
      
      const elapsedMs = estimatedServerNow - this.state.startedAtMs;
      const elapsedSec = Math.floor(elapsedMs / 1000);

      let predicted: number;
      if (this.state.direction === 'up') {
        predicted = Math.min(this.state.gameclockMax, this.state.frozenValue + elapsedSec);
      } else {
        predicted = Math.max(0, this.state.frozenValue - elapsedSec);
      }

      if (this.state.status !== tickStatus || this.state.startedAtMs !== tickStartedAtMs) {
        this.debugLog('[ClockPredictor] tick() state changed during execution, discarding result');
        return;
      }

      // Log first few ticks and every second thereafter
      tickCount++;
      if (tickCount <= 3 || tickCount % 60 === 0) {
        this.debugLog('[ClockPredictor] tick #' + tickCount + ':', {
          elapsedMs,
          elapsedSec,
          predicted,
          direction: this.state.direction,
          startedAtMs: this.state.startedAtMs,
          estimatedServerNow,
        });
      }

      this.onTick(predicted);

      const finished = this.state.direction === 'up'
        ? predicted >= this.state.gameclockMax
        : predicted <= 0;

      if (!finished) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        this.debugLog('[ClockPredictor] tick() finished, auto-stopping');
        this.animationFrameId = null;
        this.state!.status = 'stopped';
      }
    };

    tick();
  }

  private stopPrediction(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy(): void {
    this.stopPrediction();
  }
}
