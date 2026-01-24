export interface ClockState {
  status: 'running' | 'stopped' | 'paused';
  gameclockMax: number;
  startedAtMs: number | null;
  serverTimeMs: number;
  clientReceiveMs: number;
  frozenValue: number;
  rttMs: number;
}

export class ClockPredictor {
  private state: ClockState | null = null;
  private animationFrameId: number | null = null;
  private onTick: (value: number) => void;

  constructor(onTick: (value: number) => void) {
    this.onTick = onTick;
  }

  sync(data: {
    gameclock: number;
    gameclock_max: number;
    started_at_ms: number | null;
    server_time_ms: number | null;
    status: string;
    rttMs?: number;
  }): void {
    const clientReceiveMs = Date.now();
    const rttMs = data.rttMs ?? 100;
    
    console.log('[ClockPredictor] sync() called with:', JSON.stringify(data, null, 2));
    
    this.state = {
      status: data.status as ClockState['status'],
      gameclockMax: data.gameclock_max,
      startedAtMs: data.started_at_ms,
      serverTimeMs: data.server_time_ms ?? clientReceiveMs,
      clientReceiveMs,
      frozenValue: data.gameclock,
      rttMs,
    };

    console.log('[ClockPredictor] state after sync:', JSON.stringify(this.state, null, 2));
    console.log('[ClockPredictor] Checking conditions: status=', this.state.status, 'startedAtMs=', this.state.startedAtMs, 'animationFrameId=', this.animationFrameId);

    if (this.state.status === 'running' && this.state.startedAtMs) {
      if (!this.animationFrameId) {
        console.log('[ClockPredictor] Starting prediction...');
        this.startPrediction();
      } else {
        console.log('[ClockPredictor] Prediction already running, skipping startPrediction()');
      }
    } else {
      console.log('[ClockPredictor] Stopping prediction, emitting frozenValue:', this.state.frozenValue);
      this.stopPrediction();
      this.onTick(this.state.frozenValue);
    }
  }

  private startPrediction(): void {
    let tickCount = 0;
    const tick = () => {
      if (!this.state || this.state.status !== 'running' || !this.state.startedAtMs) {
        console.log('[ClockPredictor] tick() early exit - state:', this.state?.status, 'startedAtMs:', this.state?.startedAtMs);
        return;
      }

      const now = Date.now();
      const timeSinceReceive = now - this.state.clientReceiveMs;
      const estimatedServerNow = this.state.serverTimeMs + timeSinceReceive;
      
      const elapsedMs = estimatedServerNow - this.state.startedAtMs;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      
      const isResuming = this.state.frozenValue < this.state.gameclockMax;
      const baseValue = isResuming ? this.state.frozenValue : this.state.gameclockMax;
      const remaining = Math.max(0, baseValue - elapsedSec);
      
      // Log first few ticks and every second thereafter
      tickCount++;
      if (tickCount <= 3 || tickCount % 60 === 0) {
        console.log('[ClockPredictor] tick #' + tickCount + ':', {
          elapsedMs,
          elapsedSec,
          isResuming,
          baseValue,
          remaining,
          startedAtMs: this.state.startedAtMs,
          estimatedServerNow,
        });
      }
      
      this.onTick(remaining);

      if (remaining > 0) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        console.log('[ClockPredictor] tick() stopping - remaining is 0');
        this.animationFrameId = null;
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
