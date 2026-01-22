import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiLabel } from '@taiga-ui/core';
import { TuiCheckbox, TuiSlider } from '@taiga-ui/kit';
import { Scoreboard, ScoreboardUpdate } from '../../../../matches/models/scoreboard.model';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

@Component({
  selector: 'app-scoreboard-settings-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TuiLabel, TuiCheckbox, TuiSlider, CollapsibleSectionComponent],
  templateUrl: './scoreboard-settings-forms.component.html',
  styleUrl: './scoreboard-settings-forms.component.less',
})
export class ScoreboardSettingsFormsComponent {
  /** Current scoreboard settings */
  scoreboard = input<Scoreboard | null>(null);

  /** Emits partial updates to scoreboard settings */
  scoreboardChange = output<Partial<ScoreboardUpdate>>();

  // Display toggles computed from scoreboard
  protected readonly showQtr = computed(() => this.scoreboard()?.is_qtr ?? true);
  protected readonly showTime = computed(() => this.scoreboard()?.is_time ?? true);
  protected readonly showPlayClock = computed(() => this.scoreboard()?.is_playclock ?? true);
  protected readonly showDownDistance = computed(() => this.scoreboard()?.is_downdistance ?? true);
  protected readonly showTournamentLogo = computed(() => this.scoreboard()?.is_tournament_logo ?? true);
  protected readonly showMainSponsor = computed(() => this.scoreboard()?.is_main_sponsor ?? true);

  // Team color settings
  protected readonly teamAColor = computed(() => this.scoreboard()?.team_a_game_color ?? '#1a1a1a');
  protected readonly teamBColor = computed(() => this.scoreboard()?.team_b_game_color ?? '#1a1a1a');
  protected readonly useTeamAColor = computed(() => this.scoreboard()?.use_team_a_game_color ?? false);
  protected readonly useTeamBColor = computed(() => this.scoreboard()?.use_team_b_game_color ?? false);
  protected readonly useTeamATitle = computed(() => this.scoreboard()?.use_team_a_game_title ?? false);
  protected readonly useTeamBTitle = computed(() => this.scoreboard()?.use_team_b_game_title ?? false);
  protected readonly useTeamALogo = computed(() => this.scoreboard()?.use_team_a_game_logo ?? false);
  protected readonly useTeamBLogo = computed(() => this.scoreboard()?.use_team_b_game_logo ?? false);

  // Scale settings
  protected readonly tournamentLogoScale = computed(() => this.scoreboard()?.scale_tournament_logo ?? 1);
  protected readonly mainSponsorScale = computed(() => this.scoreboard()?.scale_main_sponsor ?? 1);
  protected readonly logoAScale = computed(() => this.scoreboard()?.scale_logo_a ?? 1);
  protected readonly logoBScale = computed(() => this.scoreboard()?.scale_logo_b ?? 1);

  // Toggle handlers
  onToggleQtr(value: boolean): void {
    this.scoreboardChange.emit({ is_qtr: value });
  }

  onToggleTime(value: boolean): void {
    this.scoreboardChange.emit({ is_time: value });
  }

  onTogglePlayClock(value: boolean): void {
    this.scoreboardChange.emit({ is_playclock: value });
  }

  onToggleDownDistance(value: boolean): void {
    this.scoreboardChange.emit({ is_downdistance: value });
  }

  onToggleTournamentLogo(value: boolean): void {
    this.scoreboardChange.emit({ is_tournament_logo: value });
  }

  onToggleMainSponsor(value: boolean): void {
    this.scoreboardChange.emit({ is_main_sponsor: value });
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

  onToggleUseTeamAColor(value: boolean): void {
    this.scoreboardChange.emit({ use_team_a_game_color: value });
  }

  onToggleUseTeamBColor(value: boolean): void {
    this.scoreboardChange.emit({ use_team_b_game_color: value });
  }

  onToggleUseTeamATitle(value: boolean): void {
    this.scoreboardChange.emit({ use_team_a_game_title: value });
  }

  onToggleUseTeamBTitle(value: boolean): void {
    this.scoreboardChange.emit({ use_team_b_game_title: value });
  }

  onToggleUseTeamALogo(value: boolean): void {
    this.scoreboardChange.emit({ use_team_a_game_logo: value });
  }

  onToggleUseTeamBLogo(value: boolean): void {
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
}
