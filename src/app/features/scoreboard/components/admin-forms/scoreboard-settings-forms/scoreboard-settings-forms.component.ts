import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TuiAlertService } from '@taiga-ui/core';
import { Scoreboard, ScoreboardUpdate } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';
import { ScoreboardDisplaySettingsComponent } from './display-settings/scoreboard-display-settings.component';
import { ScoreboardScaleSettingsComponent } from './scale-settings/scoreboard-scale-settings.component';
import { ScoreboardTeamSettingsComponent } from './team-settings/scoreboard-team-settings.component';
import { ScoreboardStoreService } from '../../../services/scoreboard-store.service';
import { buildStaticUrl } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-scoreboard-settings-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CollapsibleSectionComponent,
    ScoreboardDisplaySettingsComponent,
    ScoreboardTeamSettingsComponent,
    ScoreboardScaleSettingsComponent,
  ],
  templateUrl: './scoreboard-settings-forms.component.html',
  styleUrl: './scoreboard-settings-forms.component.less',
})
export class ScoreboardSettingsFormsComponent {
  private fb = inject(FormBuilder);
  private scoreboardStore = inject(ScoreboardStoreService);
  private alerts = inject(TuiAlertService);

  /** Current scoreboard settings */
  scoreboard = input<Scoreboard | null>(null);

  /** Emits partial updates to scoreboard settings */
  scoreboardChange = output<Partial<ScoreboardUpdate>>();

  teamALogoForm = this.fb.control<File | null>(null);
  teamBLogoForm = this.fb.control<File | null>(null);

  uploadingTeamALogo = signal(false);
  uploadingTeamBLogo = signal(false);

  // Display toggles computed from scoreboard
  protected readonly showQtr = computed(() => this.scoreboard()?.is_qtr ?? true);
  protected readonly showTime = computed(() => this.scoreboard()?.is_time ?? true);
  protected readonly showPlayClock = computed(() => this.scoreboard()?.is_playclock ?? true);
  protected readonly showDownDistance = computed(() => this.scoreboard()?.is_downdistance ?? true);
  protected readonly showTournamentLogo = computed(() => this.scoreboard()?.is_tournament_logo ?? true);
  protected readonly showMainSponsor = computed(() => this.scoreboard()?.is_main_sponsor ?? true);
  protected readonly showSponsorLine = computed(() => this.scoreboard()?.is_sponsor_line ?? true);

  // Local state for display toggles
  protected readonly localShowQtr = signal(true);
  protected readonly localShowTime = signal(true);
  protected readonly localShowPlayClock = signal(true);
  protected readonly localShowDownDistance = signal(true);
  protected readonly localShowTournamentLogo = signal(true);
  protected readonly localShowMainSponsor = signal(true);
  protected readonly localShowSponsorLine = signal(true);

  // Local state for team settings
  protected readonly localUseTeamAColor = signal(false);
  protected readonly localUseTeamBColor = signal(false);
  protected readonly localUseTeamATitle = signal(false);
  protected readonly localUseTeamBTitle = signal(false);
  protected readonly localUseTeamALogo = signal(false);
  protected readonly localUseTeamBLogo = signal(false);

  // Sync local state when scoreboard changes
  constructor() {
    effect(() => {
      const sb = this.scoreboard();
      if (sb) {
        this.localShowQtr.set(sb.is_qtr ?? true);
        this.localShowTime.set(sb.is_time ?? true);
        this.localShowPlayClock.set(sb.is_playclock ?? true);
        this.localShowDownDistance.set(sb.is_downdistance ?? true);
        this.localShowTournamentLogo.set(sb.is_tournament_logo ?? true);
        this.localShowMainSponsor.set(sb.is_main_sponsor ?? true);
        this.localShowSponsorLine.set(sb.is_sponsor_line ?? true);

        this.localUseTeamAColor.set(sb.use_team_a_game_color ?? false);
        this.localUseTeamBColor.set(sb.use_team_b_game_color ?? false);
        this.localUseTeamATitle.set(sb.use_team_a_game_title ?? false);
        this.localUseTeamBTitle.set(sb.use_team_b_game_title ?? false);
        this.localUseTeamALogo.set(sb.use_team_a_game_logo ?? false);
        this.localUseTeamBLogo.set(sb.use_team_b_game_logo ?? false);
      }
    });
  }

  // Team color settings
  protected readonly teamAColor = computed(() => this.scoreboard()?.team_a_game_color ?? '#1a1a1a');
  protected readonly teamBColor = computed(() => this.scoreboard()?.team_b_game_color ?? '#1a1a1a');

  // Team game titles
  protected readonly teamAGameTitle = computed(() => this.scoreboard()?.team_a_game_title ?? '');
  protected readonly teamBGameTitle = computed(() => this.scoreboard()?.team_b_game_title ?? '');

  // Team game logos
  protected readonly teamAGameLogo = computed(() => {
    const logoUrl = this.scoreboard()?.team_a_game_logo;
    return logoUrl ? buildStaticUrl(logoUrl) : '';
  });
  protected readonly teamBGameLogo = computed(() => {
    const logoUrl = this.scoreboard()?.team_b_game_logo;
    return logoUrl ? buildStaticUrl(logoUrl) : '';
  });

  // Scale settings
  protected readonly tournamentLogoScale = computed(() => this.scoreboard()?.scale_tournament_logo ?? 1);
  protected readonly mainSponsorScale = computed(() => this.scoreboard()?.scale_main_sponsor ?? 1);
  protected readonly logoAScale = computed(() => this.scoreboard()?.scale_logo_a ?? 1);
  protected readonly logoBScale = computed(() => this.scoreboard()?.scale_logo_b ?? 1);

  // Toggle handlers
  onToggleQtr(value: boolean): void {
    this.localShowQtr.set(value);
    this.scoreboardChange.emit({ is_qtr: value });
  }

  onToggleTime(value: boolean): void {
    this.localShowTime.set(value);
    this.scoreboardChange.emit({ is_time: value });
  }

  onTogglePlayClock(value: boolean): void {
    this.localShowPlayClock.set(value);
    this.scoreboardChange.emit({ is_playclock: value });
  }

  onToggleDownDistance(value: boolean): void {
    this.localShowDownDistance.set(value);
    this.scoreboardChange.emit({ is_downdistance: value });
  }

  onToggleTournamentLogo(value: boolean): void {
    this.localShowTournamentLogo.set(value);
    this.scoreboardChange.emit({ is_tournament_logo: value });
  }

  onToggleMainSponsor(value: boolean): void {
    this.localShowMainSponsor.set(value);
    this.scoreboardChange.emit({ is_main_sponsor: value });
  }

  onToggleSponsorLine(value: boolean): void {
    this.localShowSponsorLine.set(value);
    this.scoreboardChange.emit({ is_sponsor_line: value });
  }

  // Team settings handlers
  onTeamAColorChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.scoreboardChange.emit({ team_a_game_color: value });
  }

  onTeamBColorChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.scoreboardChange.emit({ team_b_game_color: value });
  }

  // New handlers for TuiInputColor (ngModelChange)
  onTeamAColorInputChange(value: string): void {
    if (value) {
      this.scoreboardChange.emit({ team_a_game_color: value });
    }
  }

  onTeamBColorInputChange(value: string): void {
    if (value) {
      this.scoreboardChange.emit({ team_b_game_color: value });
    }
  }

  onTeamAGameTitleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.scoreboardChange.emit({ team_a_game_title: value || null });
  }

  onTeamBGameTitleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.scoreboardChange.emit({ team_b_game_title: value || null });
  }

  // New handlers for TuiTextfield (ngModelChange)
  onTeamAGameTitleInputChange(value: string): void {
    this.scoreboardChange.emit({ team_a_game_title: value || null });
  }

  onTeamBGameTitleInputChange(value: string): void {
    this.scoreboardChange.emit({ team_b_game_title: value || null });
  }

  onToggleUseTeamAColor(value: boolean): void {
    this.localUseTeamAColor.set(value);
    this.scoreboardChange.emit({ use_team_a_game_color: value });
  }

  onToggleUseTeamBColor(value: boolean): void {
    this.localUseTeamBColor.set(value);
    this.scoreboardChange.emit({ use_team_b_game_color: value });
  }

  onToggleUseTeamATitle(value: boolean): void {
    this.localUseTeamATitle.set(value);
    this.scoreboardChange.emit({ use_team_a_game_title: value });
  }

  onToggleUseTeamBTitle(value: boolean): void {
    this.localUseTeamBTitle.set(value);
    this.scoreboardChange.emit({ use_team_b_game_title: value });
  }

  onToggleUseTeamALogo(value: boolean): void {
    this.localUseTeamALogo.set(value);
    this.scoreboardChange.emit({ use_team_a_game_logo: value });
  }

  onToggleUseTeamBLogo(value: boolean): void {
    this.localUseTeamBLogo.set(value);
    this.scoreboardChange.emit({ use_team_b_game_logo: value });
  }

  // Scale handlers
  onTournamentLogoScaleChange(value: number): void {
    this.scoreboardChange.emit({ scale_tournament_logo: value });
  }

  onMainSponsorScaleChange(value: number): void {
    this.scoreboardChange.emit({ scale_main_sponsor: value });
  }

  onLogoAScaleChange(value: number): void {
    this.scoreboardChange.emit({ scale_logo_a: value });
  }

  onLogoBScaleChange(value: number): void {
    this.scoreboardChange.emit({ scale_logo_b: value });
  }

  onTeamALogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.alerts.open('Please select an image file', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }
      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        this.alerts.open('File size must be less than 30MB', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }
      this.uploadTeamALogo(file);
    }
  }

  onTeamBLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.alerts.open('Please select an image file', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }
      const maxSize = 30 * 1024 * 1024;
      if (file.size > maxSize) {
        this.alerts.open('File size must be less than 30MB', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }
      this.uploadTeamBLogo(file);
    }
  }

  removeTeamALogo(): void {
    // Send empty string instead of null because backend uses exclude_none=True
    this.scoreboardChange.emit({ team_a_game_logo: '' });
    this.teamALogoForm.setValue(null);
  }

  removeTeamBLogo(): void {
    // Send empty string instead of null because backend uses exclude_none=True
    this.scoreboardChange.emit({ team_b_game_logo: '' });
    this.teamBLogoForm.setValue(null);
  }

  private uploadTeamALogo(file: File): void {
    const matchId = this.scoreboard()?.match_id;
    if (!matchId) {
      this.alerts.open('Match ID not found', { label: 'Error', appearance: 'negative' }).subscribe();
      return;
    }
    this.uploadingTeamALogo.set(true);
    this.scoreboardStore.uploadMatchTeamLogo(matchId, file).subscribe({
      next: (response) => {
        this.scoreboardChange.emit({ team_a_game_logo: response.logoUrl });
        this.uploadingTeamALogo.set(false);
        this.teamALogoForm.setValue(null);
      },
      error: () => {
        this.alerts.open('Failed to upload logo', { label: 'Error', appearance: 'negative' }).subscribe();
        this.uploadingTeamALogo.set(false);
      },
    });
  }

  private uploadTeamBLogo(file: File): void {
    const matchId = this.scoreboard()?.match_id;
    if (!matchId) {
      this.alerts.open('Match ID not found', { label: 'Error', appearance: 'negative' }).subscribe();
      return;
    }
    this.uploadingTeamBLogo.set(true);
    this.scoreboardStore.uploadMatchTeamLogo(matchId, file).subscribe({
      next: (response) => {
        this.scoreboardChange.emit({ team_b_game_logo: response.logoUrl });
        this.uploadingTeamBLogo.set(false);
        this.teamBLogoForm.setValue(null);
      },
      error: () => {
        this.alerts.open('Failed to upload logo', { label: 'Error', appearance: 'negative' }).subscribe();
        this.uploadingTeamBLogo.set(false);
      },
    });
  }
}
