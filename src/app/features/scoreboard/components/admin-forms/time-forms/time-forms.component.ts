import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { GameClock, GameClockUpdate } from '../../../../matches/models/gameclock.model';
import { PlayClock } from '../../../../matches/models/playclock.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

export interface GameClockActionEvent {
  action: 'start' | 'pause' | 'reset' | 'update';
  data?: GameClockUpdate;
}

export interface PlayClockActionEvent {
  action: 'start' | 'reset';
  seconds?: number;
}

@Component({
  selector: 'app-time-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiButton,
    TuiIcon,
    TuiTextfield,
    TuiInputNumber,
    CollapsibleSectionComponent,
  ],
  templateUrl: './time-forms.component.html',
  styleUrl: './time-forms.component.less',
})
export class TimeFormsComponent {
  /** Current game clock state */
  gameClock = input<GameClock | null>(null);

  /** Current play clock state */
  playClock = input<PlayClock | null>(null);

  /** Emits game clock actions */
  gameClockAction = output<GameClockActionEvent>();

  /** Emits play clock actions */
  playClockAction = output<PlayClockActionEvent>();

  /** Whether to show play clock section */
  showPlayClock = input(true);

  /** Whether to show game clock section */
  showGameClock = input(true);

  supportsPlayClock = input(true);

  gameClockLocked = input(false);
   playClockLocked = input(false);

   // Local state for manual time entry
    protected readonly manualMinutes = signal<number>(0);
    protected readonly manualSeconds = signal<number>(0);
    protected readonly maxMinutes = signal<number>(0);
    protected readonly isEditingTime = signal<boolean>(false);
   
   // Flag to prevent sync from overwriting input immediately after Set is clicked
   private readonly pendingSetUpdate = signal<boolean>(false);



   // Computed values from game clock
   protected readonly gameClockSeconds = computed(() => {
     const gc = this.gameClock();
     return gc?.gameclock ?? 0;
   });

   protected readonly gameClockRunning = computed(() => {
     const gc = this.gameClock();
     return gc?.gameclock_status === 'running';
   });

   protected readonly gameClockReady = computed(() => Boolean(this.gameClock()?.id));

    // Sync manual time inputs with websocket gameclock when not editing
    private syncWithGameClock = effect(() => {
      const gc = this.gameClock();
      if (!this.isEditingTime() && !this.pendingSetUpdate() && gc) {
        const seconds = this.gameClockSeconds();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.manualMinutes.set(mins);
        this.manualSeconds.set(secs);

        // Initialize maxMinutes from gameclock_max
        const maxSeconds = gc.gameclock_max ?? 0;
        this.maxMinutes.set(Math.floor(maxSeconds / 60));
      }
    });

   // Disable inputs when gameclock is running
   protected readonly inputsDisabled = computed(() => {
     return this.gameClockRunning() || this.gameClockLocked();
   });

    protected readonly currentMaxMinutes = computed(() => {
      const gc = this.gameClock();
      const maxSeconds = gc?.gameclock_max ?? 0;
      if (gc && gc.gameclock_max == null) {
        console.warn('[TimeFormsComponent] gameclock_max is null/undefined. Backend should provide gameclock_max based on sport configuration.');
      }
      return Math.floor(maxSeconds / 60);
    });

    protected readonly gameClockDisplay = computed(() => {
       const seconds = this.gameClockSeconds();
       return this.formatTime(seconds);
     });

    // Computed values from play clock
    protected readonly playClockSeconds = computed(() => {
      const pc = this.playClock();
      return pc?.playclock ?? 0;
    });

    protected readonly playClockRunning = computed(() => {
      const pc = this.playClock();
      return pc?.playclock_status === 'running';
    });

    protected readonly playClockReady = computed(() => {
      return this.supportsPlayClock() && Boolean(this.playClock()?.id);
    });

    protected readonly playClockDisplay = signal<number | null>(null);

    protected readonly playClockWarning = computed(() => {
      const display = this.playClockDisplay();
      return display != null && display <= 5;
    });

    private playClockClearTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private resetSuppressed = signal<boolean>(false);

    private readonly syncPlayClockDisplay = effect(() => {
      const pc = this.playClock();
      const seconds = pc?.playclock ?? null;

      if (this.resetSuppressed() && !this.playClockRunning()) {
        this.clearPlayClockTimeout();
        this.playClockDisplay.set(null);
        return;
      }

      if (this.resetSuppressed() && this.playClockRunning()) {
        this.resetSuppressed.set(false);
      }

      if (seconds == null || seconds > 0) {
        this.clearPlayClockTimeout();
        this.playClockDisplay.set(seconds);
        return;
      }

      this.playClockDisplay.set(0);

      if (this.playClockClearTimeoutId == null) {
        this.playClockClearTimeoutId = setTimeout(() => {
          const currentSeconds = this.playClock()?.playclock ?? null;
          if (currentSeconds === 0) {
            this.playClockDisplay.set(null);
          }
          this.playClockClearTimeoutId = null;
        }, 3000);
      }
    });

   /**
    * Format seconds to MM:SS display
    */
  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Start or resume game clock
   */
  onGameClockStart(): void {
    this.gameClockAction.emit({ action: 'start' });
  }

  /**
   * Pause game clock
   */
  onGameClockPause(): void {
    this.gameClockAction.emit({ action: 'pause' });
  }

  /**
   * Reset game clock to max time
   */
  onGameClockReset(): void {
    this.gameClockAction.emit({ action: 'reset' });
  }

  /**
   * Set game clock manually
   */
  onSetGameClock(): void {
    const mins = this.manualMinutes();
    const secs = this.manualSeconds();
    const totalSeconds = mins * 60 + secs;

    this.pendingSetUpdate.set(true);
    this.gameClockAction.emit({
      action: 'update',
      data: { gameclock: totalSeconds },
    });

    setTimeout(() => this.pendingSetUpdate.set(false), 500);
  }

  /**
   * Update max quarter time
   */
  onMaxMinutesChange(minutes: number): void {
    this.maxMinutes.set(minutes);
  }

  /**
   * Save quarter length to backend
   */
  onSaveQuarterLength(): void {
    const minutes = this.currentMaxMinutes();
    const maxSeconds = minutes * 60;
    this.gameClockAction.emit({
      action: 'update',
      data: { gameclock_max: maxSeconds },
    });
  }

  /**
   * Update manual minutes input
   */
  onManualMinutesChange(minutes: number): void {
    this.isEditingTime.set(true);
    this.manualMinutes.set(minutes);
  }

  /**
   * Update manual seconds input
   */
  onManualSecondsChange(seconds: number): void {
    this.isEditingTime.set(true);
    this.manualSeconds.set(seconds);
  }

  /**
   * Handle input focus - prevent sync from overwriting user input
   */
  onInputFocus(): void {
    this.isEditingTime.set(true);
  }

  /**
   * Handle input blur - allow sync to resume
   */
  onInputBlur(): void {
    setTimeout(() => this.isEditingTime.set(false), 0);
  }

  /**
   * Start play clock with specified seconds
   */
  onPlayClockStart(seconds: number): void {
    this.playClockAction.emit({ action: 'start', seconds });
  }

  /**
   * Reset play clock
   */
  onPlayClockReset(): void {
    this.clearPlayClockTimeout();
    this.playClockDisplay.set(null);
    this.resetSuppressed.set(true);
    this.playClockAction.emit({ action: 'reset' });
  }

  private clearPlayClockTimeout(): void {
    if (this.playClockClearTimeoutId != null) {
      clearTimeout(this.playClockClearTimeoutId);
      this.playClockClearTimeoutId = null;
    }
  }
}
