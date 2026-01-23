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
    
    this.state = {
      status: data.status as ClockState['status'],
      gameclockMax: data.gameclock_max,
      startedAtMs: data.started_at_ms,
      serverTimeMs: data.server_time_ms ?? clientReceiveMs,
      clientReceiveMs,
      frozenValue: data.gameclock,
      rttMs,
    };

    if (this.state.status === 'running' && this.state.startedAtMs) {
      if (!this.animationFrameId) {
        this.startPrediction();
      }
    } else {
      this.stopPrediction();
      this.onTick(this.state.frozenValue);
    }
  }

  private startPrediction(): void {
    const tick = () => {
      if (!this.state || this.state.status !== 'running' || !this.state.startedAtMs) {
        return;
      }

      const now = Date.now();
      const timeSinceReceive = now - this.state.clientReceiveMs;
      const estimatedServerNow = this.state.serverTimeMs + timeSinceReceive;
      
      const elapsedMs = estimatedServerNow - this.state.startedAtMs;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      
      const remaining = Math.max(0, this.state.gameclockMax - elapsedSec);
      
      this.onTick(remaining);

      if (remaining > 0) {
        this.animationFrameId = requestAnimationFrame(tick);
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
