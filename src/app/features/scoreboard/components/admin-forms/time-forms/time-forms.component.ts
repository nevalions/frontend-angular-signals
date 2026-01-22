import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { GameClock, GameClockUpdate } from '../../../../matches/models/gameclock.model';
import { PlayClock } from '../../../../matches/models/playclock.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { InputNumberWithButtonsComponent } from '../input-number-with-buttons/input-number-with-buttons.component';

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
    InputNumberWithButtonsComponent,
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

  // Local state for manual time entry
  protected readonly manualMinutes = signal<number>(12);
  protected readonly manualSeconds = signal<number>(0);
  protected readonly maxMinutes = signal<number>(12);

  // Computed values from game clock
  protected readonly gameClockSeconds = computed(() => {
    const gc = this.gameClock();
    return gc?.gameclock ?? 0;
  });

  protected readonly gameClockRunning = computed(() => {
    const gc = this.gameClock();
    return gc?.gameclock_status === 'running';
  });

  protected readonly gameClockDisplay = computed(() => {
    const seconds = this.gameClockSeconds();
    return this.formatTime(seconds);
  });

  protected readonly currentMaxMinutes = computed(() => {
    const gc = this.gameClock();
    const maxSeconds = gc?.gameclock_max ?? 720; // Default 12 minutes
    return Math.floor(maxSeconds / 60);
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
    this.gameClockAction.emit({
      action: 'update',
      data: { gameclock: totalSeconds },
    });
  }

  /**
   * Update max quarter time
   */
  onMaxMinutesChange(minutes: number): void {
    this.maxMinutes.set(minutes);
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
    this.manualMinutes.set(minutes);
  }

  /**
   * Update manual seconds input
   */
  onManualSecondsChange(seconds: number): void {
    this.manualSeconds.set(seconds);
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
    this.playClockAction.emit({ action: 'reset' });
  }
}
