export interface ClockState {
  value: number;
  status: 'running' | 'stopped' | 'paused';
  serverTime: number;
  clientTime: number;
}

export class ClockPredictor {
  private state: ClockState | null = null;
  private animationFrameId: number | null = null;
  private onTick: (value: number) => void;

  constructor(onTick: (value: number) => void) {
    this.onTick = onTick;
  }

  sync(serverClock: { value: number; status: string; timestamp?: number }): void {
    console.log('[ClockPredictor] sync called with:', JSON.stringify(serverClock));
    console.log('[ClockPredictor] Previous state:', JSON.stringify(this.state));

    this.state = {
      value: serverClock.value,
      status: serverClock.status as ClockState['status'],
      serverTime: serverClock.timestamp ?? Date.now(),
      clientTime: Date.now()
    };

    console.log('[ClockPredictor] New state:', JSON.stringify(this.state));

    if (this.state.status === 'running' && !this.animationFrameId) {
      console.log('[ClockPredictor] Status is running, starting prediction');
      this.startPrediction();
    } else if (this.state.status !== 'running') {
      console.log('[ClockPredictor] Status is NOT running (' + this.state.status + '), stopping prediction and emitting value:', this.state.value);
      this.stopPrediction();
      this.onTick(this.state.value);
    } else {
      console.log('[ClockPredictor] Status is running but prediction already active');
    }
  }

  private startPrediction(): void {
    const tick = () => {
      if (!this.state || this.state.status !== 'running') return;

      const elapsed = (Date.now() - this.state.clientTime) / 1000;
      const predictedValue = Math.max(0, this.state.value - elapsed);

      this.onTick(Math.floor(predictedValue));

      if (predictedValue > 0) {
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
