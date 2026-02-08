import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';
import { Scoreboard } from '../../../matches/models/scoreboard.model';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import {
  breathingAnimation,
  fadeInOutAnimation,
  scoreChangeAnimation,
  teamTitleSwapAnimation,
} from '../../animations';
import { AutoFitTextDirective } from '../../../../shared/directives/auto-fit-text.directive';
import { Sponsor } from '../../../../shared/types';
import {
  selectMatchMainSponsor,
  selectMatchSponsorLine,
  selectTournamentMainSponsor,
  selectTournamentSponsorLine,
} from '../../../matches/utils/sponsors-data.util';

export type ScoreboardDisplayMode = 'scoreboard' | 'fullhd-scoreboard';

@Component({
  selector: 'app-scoreboard-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AutoFitTextDirective],
  templateUrl: './scoreboard-display.component.html',
  styleUrl: './scoreboard-display.component.less',
  animations: [scoreChangeAnimation, fadeInOutAnimation, breathingAnimation, teamTitleSwapAnimation],
})
export class ScoreboardDisplayComponent {
  /** Comprehensive match data containing teams, scores, and scoreboard settings */
  data = input<ComprehensiveMatchData | null>(null);

  /** Current game clock value in seconds */
  gameClock = input<number>(0);

  /** Current play clock value in seconds or null if not displayed */
  playClock = input<number | null>(null);

  /** Display mode: 'scoreboard' for admin preview, 'fullhd-scoreboard' for HD view */
  displayClass = input<ScoreboardDisplayMode>('fullhd-scoreboard');

  /** Tournament main sponsor logo URL */
  tournamentSponsorLogo = input<string | null>(null);

  /** Tournament logo URL */
  tournamentLogo = input<string | null>(null);

  // Track previous scores for animation triggers
  private previousScoreA = signal<number>(0);
  private previousScoreB = signal<number>(0);

  // Scoreboard settings computed from data
  protected readonly scoreboard = computed<Scoreboard | null>(() => {
    const d = this.data();
    if (!d?.scoreboard) return null;

    const scoreboard = d.scoreboard;

    // Map comprehensive match scoreboard to full Scoreboard interface
    return {
      ...scoreboard,
      is_qtr: scoreboard.is_qtr ?? true,
      is_time: scoreboard.is_time ?? true,
      is_playclock: scoreboard.is_playclock ?? true,
      is_downdistance: scoreboard.is_downdistance ?? true,
      is_tournament_logo: scoreboard.is_tournament_logo ?? true,
      is_main_sponsor: scoreboard.is_main_sponsor ?? true,
      is_sponsor_line: scoreboard.is_sponsor_line ?? false,
      is_match_sponsor_line: scoreboard.is_match_sponsor_line ?? false,
      team_a_game_color: scoreboard.team_a_game_color ?? '#1a1a1a',
      team_b_game_color: scoreboard.team_b_game_color ?? '#1a1a1a',
      team_a_game_title: scoreboard.team_a_game_title ?? null,
      team_b_game_title: scoreboard.team_b_game_title ?? null,
      scale_tournament_logo: scoreboard.scale_tournament_logo ?? 1,
      scale_main_sponsor: scoreboard.scale_main_sponsor ?? 1,
      scale_logo_a: scoreboard.scale_logo_a ?? 1,
      scale_logo_b: scoreboard.scale_logo_b ?? 1,
    };
  });

  // Team A computed values
  protected readonly teamAName = computed(() => {
    const d = this.data();
    const sb = this.scoreboard();
    if (sb?.use_team_a_game_title && sb.team_a_game_title) {
      return sb.team_a_game_title;
    }
    return d?.teams?.team_a?.title || 'Team A';
  });

  protected readonly teamALogo = computed(() => {
    const d = this.data();
    const sb = this.scoreboard();
    if (sb?.use_team_a_game_logo && sb.team_a_game_logo) {
      return buildStaticUrl(sb.team_a_game_logo);
    }
    return d?.teams?.team_a?.team_logo_web_url
      ? buildStaticUrl(d.teams.team_a.team_logo_web_url)
      : null;
  });

  protected readonly teamAColor = computed(() => {
    const d = this.data();
    const sb = this.scoreboard();
    if (sb?.use_team_a_game_color) {
      return sb.team_a_game_color ?? '#1a1a1a';
    }
    return d?.teams?.team_a?.team_color ?? '#1a1a1a';
  });

  protected readonly scoreA = computed(() => {
    const d = this.data();
    return d?.match_data?.score_team_a ?? 0;
  });

  protected readonly timeoutTeamA = computed(() => {
    const d = this.data();
    return d?.match_data?.timeout_team_a || '';
  });

  // Team B computed values
  protected readonly teamBName = computed(() => {
    const d = this.data();
    const sb = this.scoreboard();
    if (sb?.use_team_b_game_title && sb.team_b_game_title) {
      return sb.team_b_game_title;
    }
    return d?.teams?.team_b?.title || 'Team B';
  });

  protected readonly teamBLogo = computed(() => {
    const d = this.data();
    const sb = this.scoreboard();
    if (sb?.use_team_b_game_logo && sb.team_b_game_logo) {
      return buildStaticUrl(sb.team_b_game_logo);
    }
    return d?.teams?.team_b?.team_logo_web_url
      ? buildStaticUrl(d.teams.team_b.team_logo_web_url)
      : null;
  });

  protected readonly teamBColor = computed(() => {
    const d = this.data();
    const sb = this.scoreboard();
    if (sb?.use_team_b_game_color) {
      return sb.team_b_game_color ?? '#1a1a1a';
    }
    return d?.teams?.team_b?.team_color ?? '#1a1a1a';
  });

  protected readonly scoreB = computed(() => {
    const d = this.data();
    return d?.match_data?.score_team_b ?? 0;
  });

  protected readonly timeoutTeamB = computed(() => {
    const d = this.data();
    return d?.match_data?.timeout_team_b || '';
  });

  // Game info computed values
  protected readonly quarter = computed(() => {
    const d = this.data();
    return d?.match_data?.qtr || '1st';
  });

  protected readonly down = computed(() => {
    const d = this.data();
    return d?.match_data?.down ?? '1st';
  });

  protected readonly distance = computed(() => {
    const d = this.data();
    return d?.match_data?.distance || '10';
  });

  protected readonly downDistance = computed(() => {
    const d = this.down();
    const dist = this.distance();
    return d ? `${d} & ${dist}` : dist;
  });

  // Formatted clock displays
  protected readonly gameClockDisplay = computed(() => {
    const seconds = this.gameClock();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  protected readonly playClockDisplay = computed(() => {
    const pc = this.playClock();
    return pc !== null ? pc.toString() : '';
  });

  protected readonly playClockWarning = computed(() => {
    const pc = this.playClock();
    return pc !== null && pc <= 5;
  });

  // Visibility flags
  protected readonly showQuarter = computed(() => this.scoreboard()?.is_qtr ?? true);
  protected readonly showTime = computed(() => this.scoreboard()?.is_time ?? true);
  protected readonly showPlayClock = computed(() => this.scoreboard()?.is_playclock ?? true);
  protected readonly showDownDistance = computed(() => this.scoreboard()?.is_downdistance ?? true);
  protected readonly showTournamentLogo = computed(() => this.scoreboard()?.is_tournament_logo ?? true);
  protected readonly showMainSponsor = computed(() => this.scoreboard()?.is_main_sponsor ?? true);
  protected readonly showFlag = computed(() => this.scoreboard()?.is_flag ?? false);
  protected readonly showGoalTeamA = computed(() => this.scoreboard()?.is_goal_team_a ?? false);
  protected readonly showGoalTeamB = computed(() => this.scoreboard()?.is_goal_team_b ?? false);
  protected readonly showTimeoutTeamA = computed(() => this.scoreboard()?.is_timeout_team_a ?? false);
  protected readonly showTimeoutTeamB = computed(() => this.scoreboard()?.is_timeout_team_b ?? false);
  protected readonly showSponsorLine = computed(() => this.scoreboard()?.is_sponsor_line ?? false);
  protected readonly showMatchSponsorLine = computed(() => this.scoreboard()?.is_match_sponsor_line ?? false);

  protected readonly sponsorLine = computed(() => {
    const sb = this.scoreboard();
    return sb?.is_match_sponsor_line ? selectMatchSponsorLine(this.data()) : selectTournamentSponsorLine(this.data());
  });

  protected readonly mainSponsor = computed(() => {
    const inputSponsor = this.tournamentSponsorLogo();
    if (inputSponsor && typeof inputSponsor === 'string') {
      return { id: 0, title: '', logo_url: inputSponsor } as Sponsor;
    }

    const sb = this.scoreboard();
    return sb?.is_match_sponsor_line ? selectMatchMainSponsor(this.data()) : selectTournamentMainSponsor(this.data());
  });

  // Logo URLs
  protected readonly tournamentLogoUrl = computed(() => {
    const logo = this.tournamentLogo() ?? this.data()?.match?.tournament?.tournament_logo_web_url ?? null;
    return logo ? this.toAssetUrl(logo) : null;
  });

  protected readonly sponsorLogoUrl = computed(() => {
    const sponsor = this.mainSponsor();
    const logoUrl = typeof sponsor === 'string' ? sponsor : sponsor?.logo_url ?? null;
    return logoUrl ? this.toAssetUrl(logoUrl) : null;
  });

  // Logo scaling
  protected readonly tournamentLogoScale = computed(() => {
    const sb = this.scoreboard();
    return sb?.scale_tournament_logo ?? 1;
  });

  protected readonly sponsorLogoScale = computed(() => {
    const sb = this.scoreboard();
    return sb?.scale_main_sponsor ?? 1;
  });

  protected readonly sponsorLineScale = computed(() => this.scoreboard()?.scale_main_sponsor ?? null);
  protected readonly matchSponsorLineScale = computed(() => this.scoreboard()?.scale_main_sponsor ?? null);

  protected readonly teamALogoScale = computed(() => {
    const sb = this.scoreboard();
    return sb?.scale_logo_a ?? 1;
  });

  protected readonly teamBLogoScale = computed(() => {
    const sb = this.scoreboard();
    return sb?.scale_logo_b ?? 1;
  });

  // Animation state for breathing effect on goal indicators
  protected readonly goalAnimationState = computed(() => {
    return this.showGoalTeamA() || this.showGoalTeamB() ? 'active' : 'inactive';
  });

  // Timeout display helpers - convert timeout string to array for display
  protected readonly timeoutAIndicators = computed(() => {
    return this.parseTimeoutString(this.timeoutTeamA());
  });

  protected readonly timeoutBIndicators = computed(() => {
    return this.parseTimeoutString(this.timeoutTeamB());
  });

  constructor() {
    // Track score changes for animation
    effect(() => {
      const newScoreA = this.scoreA();
      if (newScoreA !== this.previousScoreA()) {
        this.previousScoreA.set(newScoreA);
      }
    });

    effect(() => {
      const newScoreB = this.scoreB();
      if (newScoreB !== this.previousScoreB()) {
        this.previousScoreB.set(newScoreB);
      }
    });
  }

  /**
   * Parse timeout string (e.g., "ooo" or "oo●") into array of used/unused indicators
   */
  private parseTimeoutString(timeout: string): boolean[] {
    if (!timeout) return [false, false, false];

    // 'o' = available (visible), '●' = used (faded)
    const result: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      const char = timeout[i];
      // 'o' = available → true (adds .used class, opacity 0.81, visible)
      // '●' = used → false (no .used class, opacity 0.3, faded)
      result.push(char === 'o');
    }
    return result;
  }

  private toAssetUrl(urlOrPath: string): string {
    return /^https?:\/\//i.test(urlOrPath) ? urlOrPath : buildStaticUrl(urlOrPath);
  }

  // Lower display data is handled by dedicated lower display components in the view.
}
