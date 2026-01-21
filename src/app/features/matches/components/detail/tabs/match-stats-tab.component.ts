import { ChangeDetectionStrategy, Component, input, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchStoreService } from '../../../services/match-store.service';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { MatchStats } from '../../../models/match-stats.model';
import { TuiProgress, TuiAvatar } from '@taiga-ui/kit';
import { TuiTitle, TuiIcon, TuiAppearance, TuiSurface } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { buildStaticUrl as buildStaticUrlUtil } from '../../../../../core/config/api.constants';

interface StatRow {
  label: string;
  teamA: number;
  teamB: number;
  icon?: string;
  isHighlight?: boolean;
}

interface StatCategory {
  title: string;
  icon: string;
  stats: StatRow[];
  collapsed?: boolean;
}

@Component({
  selector: 'app-match-stats-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TuiProgress,
    TuiAvatar,
    TuiTitle,
    TuiIcon,
    TuiAppearance,
    TuiSurface,
    TuiCardLarge,
    TuiHeader,
  ],
  template: `
    @if (comprehensiveData()) {
      <div class="match-stats-tab">
        <!-- Team Header Comparison -->
        <div tuiCardLarge tuiSurface="floating" class="match-stats-tab__team-header">
          <div class="match-stats-tab__team-comparison">
            <div class="match-stats-tab__team match-stats-tab__team--a">
              <tui-avatar
                [src]="getTeamLogo(comprehensiveData()!.teams.team_a)"
                size="l"
                class="match-stats-tab__team-logo"
              >
                {{ getInitials(comprehensiveData()!.teams.team_a.title) }}
              </tui-avatar>
              <span class="match-stats-tab__team-name">
                {{ comprehensiveData()!.teams.team_a.title }}
              </span>
            </div>

            <div class="match-stats-tab__vs">
              <span class="match-stats-tab__vs-text">VS</span>
            </div>

            <div class="match-stats-tab__team match-stats-tab__team--b">
              <tui-avatar
                [src]="getTeamLogo(comprehensiveData()!.teams.team_b)"
                size="l"
                class="match-stats-tab__team-logo"
              >
                {{ getInitials(comprehensiveData()!.teams.team_b.title) }}
              </tui-avatar>
              <span class="match-stats-tab__team-name">
                {{ comprehensiveData()!.teams.team_b.title }}
              </span>
            </div>
          </div>

          <!-- Legend -->
          <div class="match-stats-tab__legend">
            <div class="match-stats-tab__legend-item">
              <div class="match-stats-tab__legend-color match-stats-tab__legend-color--a"></div>
              <span>{{ comprehensiveData()!.teams.team_a.title }}</span>
            </div>
            <div class="match-stats-tab__legend-item">
              <div class="match-stats-tab__legend-color match-stats-tab__legend-color--b"></div>
              <span>{{ comprehensiveData()!.teams.team_b.title }}</span>
            </div>
          </div>
        </div>

        @if (stats()) {
          <!-- Stats Categories -->
          @for (category of statCategories(); track category.title) {
            <div tuiCardLarge tuiSurface="floating" class="match-stats-tab__category">
              <header tuiHeader class="match-stats-tab__category-header">
                <hgroup tuiTitle>
                  <h3>
                    <tui-icon [icon]="category.icon" class="match-stats-tab__category-icon" />
                    {{ category.title }}
                  </h3>
                </hgroup>
              </header>

              <div class="match-stats-tab__stats-grid">
                @for (stat of category.stats; track stat.label) {
                  <div
                    class="match-stats-tab__stat-row"
                    [class.match-stats-tab__stat-row--highlight]="stat.isHighlight"
                  >
                    <div class="match-stats-tab__stat-bar-container">
                      <!-- Team A Bar (right-aligned, grows left) -->
                      <div class="match-stats-tab__bar-wrapper match-stats-tab__bar-wrapper--a">
                        <div
                          class="match-stats-tab__bar match-stats-tab__bar--a"
                          [class.match-stats-tab__bar--winner]="stat.teamA > stat.teamB"
                          [style.width.%]="getBarWidth(stat.teamA, stat.teamB)"
                        ></div>
                      </div>

                      <!-- Value A -->
                      <div class="match-stats-tab__value match-stats-tab__value--a"
                           [class.match-stats-tab__value--winner]="stat.teamA > stat.teamB">
                        {{ formatValue(stat.teamA) }}
                      </div>

                      <!-- Label -->
                      <div class="match-stats-tab__label">
                        @if (stat.icon) {
                          <tui-icon [icon]="stat.icon" class="match-stats-tab__label-icon" />
                        }
                        <span>{{ stat.label }}</span>
                      </div>

                      <!-- Value B -->
                      <div class="match-stats-tab__value match-stats-tab__value--b"
                           [class.match-stats-tab__value--winner]="stat.teamB > stat.teamA">
                        {{ formatValue(stat.teamB) }}
                      </div>

                      <!-- Team B Bar (left-aligned, grows right) -->
                      <div class="match-stats-tab__bar-wrapper match-stats-tab__bar-wrapper--b">
                        <div
                          class="match-stats-tab__bar match-stats-tab__bar--b"
                          [class.match-stats-tab__bar--winner]="stat.teamB > stat.teamA"
                          [style.width.%]="getBarWidth(stat.teamB, stat.teamA)"
                        ></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        } @else {
          <div class="match-stats-tab__loading-stats" tuiSurface="neutral">
            <tui-icon icon="@tui.loader" class="match-stats-tab__loading-icon" />
            <span>Loading statistics...</span>
          </div>
        }
      </div>
    } @else {
      <div class="match-stats-tab__loading">
        <div class="match-stats-tab__loading-content">
          <tui-icon icon="@tui.loader" class="match-stats-tab__loading-icon" />
          <span>Loading statistics...</span>
        </div>
      </div>
    }
  `,
  styleUrl: './match-stats-tab.component.less',
})
export class MatchStatsTabComponent implements OnInit {
  comprehensiveData = input<ComprehensiveMatchData | null>(null);
  private matchStore = inject(MatchStoreService);

  stats = signal<MatchStats | null>(null);

  teamATitle = computed(() => this.comprehensiveData()?.teams.team_a.title || 'Team A');
  teamBTitle = computed(() => this.comprehensiveData()?.teams.team_b.title || 'Team B');

  statCategories = computed<StatCategory[]>(() => {
    const stats = this.stats();
    if (!stats) return [];

    return [
      {
        title: 'Team Performance',
        icon: '@tui.bar-chart-2',
        stats: this.getTeamStats(stats),
      },
      {
        title: 'Offensive Stats',
        icon: '@tui.trending-up',
        stats: this.getOffenseStats(stats),
      },
      {
        title: 'Quarterback Stats',
        icon: '@tui.target',
        stats: this.getQbStats(stats),
      },
      {
        title: 'Defensive Stats',
        icon: '@tui.shield',
        stats: this.getDefenseStats(stats),
      },
    ];
  });

  private getTeamStats(stats: MatchStats): StatRow[] {
    const teamA = stats.team_a.team_stats;
    const teamB = stats.team_b.team_stats;
    return [
      { label: 'Total Yards', teamA: teamA?.offence_yards || 0, teamB: teamB?.offence_yards || 0, icon: '@tui.move', isHighlight: true },
      { label: 'First Downs', teamA: teamA?.first_down_gained || 0, teamB: teamB?.first_down_gained || 0, isHighlight: true },
      { label: 'Pass Attempts', teamA: teamA?.pass_att || 0, teamB: teamB?.pass_att || 0 },
      { label: 'Pass Yards', teamA: teamA?.pass_yards || 0, teamB: teamB?.pass_yards || 0 },
      { label: 'Run Attempts', teamA: teamA?.run_att || 0, teamB: teamB?.run_att || 0 },
      { label: 'Run Yards', teamA: teamA?.run_yards || 0, teamB: teamB?.run_yards || 0 },
      { label: 'Avg Yards/Att', teamA: teamA?.avg_yards_per_att || 0, teamB: teamB?.avg_yards_per_att || 0 },
      { label: '3rd Down Conv', teamA: teamA?.third_down_conversions || 0, teamB: teamB?.third_down_conversions || 0 },
      { label: '4th Down Conv', teamA: teamA?.fourth_down_conversions || 0, teamB: teamB?.fourth_down_conversions || 0 },
      { label: 'Turnovers', teamA: teamA?.turnovers || 0, teamB: teamB?.turnovers || 0, icon: '@tui.alert-triangle' },
      { label: 'Penalty Yards', teamA: teamA?.flag_yards || 0, teamB: teamB?.flag_yards || 0 },
    ];
  }

  private getOffenseStats(stats: MatchStats): StatRow[] {
    const teamA = stats.team_a.offense_stats;
    const teamB = stats.team_b.offense_stats;
    return [
      { label: 'Pass Attempts', teamA: teamA?.pass_attempts || 0, teamB: teamB?.pass_attempts || 0 },
      { label: 'Receptions', teamA: teamA?.pass_received || 0, teamB: teamB?.pass_received || 0 },
      { label: 'Pass Yards', teamA: teamA?.pass_yards || 0, teamB: teamB?.pass_yards || 0, isHighlight: true },
      { label: 'Pass TDs', teamA: teamA?.pass_td || 0, teamB: teamB?.pass_td || 0, icon: '@tui.award', isHighlight: true },
      { label: 'Rush Attempts', teamA: teamA?.run_attempts || 0, teamB: teamB?.run_attempts || 0 },
      { label: 'Rush Yards', teamA: teamA?.run_yards || 0, teamB: teamB?.run_yards || 0, isHighlight: true },
      { label: 'Rush Avg', teamA: teamA?.run_avr || 0, teamB: teamB?.run_avr || 0 },
      { label: 'Rush TDs', teamA: teamA?.run_td || 0, teamB: teamB?.run_td || 0, icon: '@tui.award', isHighlight: true },
      { label: 'Fumbles', teamA: teamA?.fumble || 0, teamB: teamB?.fumble || 0, icon: '@tui.alert-circle' },
    ];
  }

  private getQbStats(stats: MatchStats): StatRow[] {
    const teamA = stats.team_a.qb_stats;
    const teamB = stats.team_b.qb_stats;
    return [
      { label: 'Pass Attempts', teamA: teamA?.passes || 0, teamB: teamB?.passes || 0 },
      { label: 'Completions', teamA: teamA?.passes_completed || 0, teamB: teamB?.passes_completed || 0 },
      { label: 'Pass Yards', teamA: teamA?.pass_yards || 0, teamB: teamB?.pass_yards || 0, isHighlight: true },
      { label: 'Pass TDs', teamA: teamA?.pass_td || 0, teamB: teamB?.pass_td || 0, icon: '@tui.award', isHighlight: true },
      { label: 'Pass Avg', teamA: teamA?.pass_avr || 0, teamB: teamB?.pass_avr || 0 },
      { label: 'QB Rating', teamA: teamA?.qb_rating || 0, teamB: teamB?.qb_rating || 0, icon: '@tui.star', isHighlight: true },
      { label: 'Rush Attempts', teamA: teamA?.run_attempts || 0, teamB: teamB?.run_attempts || 0 },
      { label: 'Rush Yards', teamA: teamA?.run_yards || 0, teamB: teamB?.run_yards || 0 },
      { label: 'Rush TDs', teamA: teamA?.run_td || 0, teamB: teamB?.run_td || 0 },
      { label: 'Interceptions', teamA: teamA?.interception || 0, teamB: teamB?.interception || 0, icon: '@tui.x-circle' },
      { label: 'Fumbles', teamA: teamA?.fumble || 0, teamB: teamB?.fumble || 0 },
    ];
  }

  private getDefenseStats(stats: MatchStats): StatRow[] {
    const teamA = stats.team_a.defense_stats;
    const teamB = stats.team_b.defense_stats;
    return [
      { label: 'Tackles', teamA: teamA?.tackles || 0, teamB: teamB?.tackles || 0, isHighlight: true },
      { label: 'Assist Tackles', teamA: teamA?.assist_tackles || 0, teamB: teamB?.assist_tackles || 0 },
      { label: 'Sacks', teamA: teamA?.sacks || 0, teamB: teamB?.sacks || 0, icon: '@tui.zap', isHighlight: true },
      { label: 'Interceptions', teamA: teamA?.interceptions || 0, teamB: teamB?.interceptions || 0, icon: '@tui.shield', isHighlight: true },
      { label: 'Fumble Recoveries', teamA: teamA?.fumble_recoveries || 0, teamB: teamB?.fumble_recoveries || 0 },
      { label: 'Penalties', teamA: teamA?.flags || 0, teamB: teamB?.flags || 0, icon: '@tui.flag' },
    ];
  }

  ngOnInit(): void {
    const data = this.comprehensiveData();
    if (data?.match.id) {
      this.matchStore.getMatchStats(data.match.id).subscribe({
        next: (stats: MatchStats) => {
          this.stats.set(stats);
        },
        error: (err: Error) => {
          console.error('Failed to load match stats:', err);
        }
      });
    }
  }

  getTeamLogo(team: { team_logo_url?: string | null }): string | null {
    return team.team_logo_url ? buildStaticUrlUtil(team.team_logo_url) : null;
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getBarWidth(value: number, otherValue: number): number {
    const total = value + otherValue;
    if (total === 0) return 50;
    return (value / total) * 100;
  }

  formatValue(value: number): string {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(1);
  }
}
