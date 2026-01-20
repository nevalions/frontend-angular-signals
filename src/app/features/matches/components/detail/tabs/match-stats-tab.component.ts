import { ChangeDetectionStrategy, Component, input, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchStoreService } from '../../../services/match-store.service';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { MatchStats } from '../../../models/match-stats.model';
import { TuiProgress } from '@taiga-ui/kit';
import { TuiTitle, TuiIcon } from '@taiga-ui/core';

interface StatRow {
  label: string;
  teamA: number;
  teamB: number;
}

@Component({
  selector: 'app-match-stats-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TuiProgress, TuiTitle, TuiIcon],
  template: `
    @if (comprehensiveData()) {
      <div class="match-stats-tab">
        <div class="match-stats-tab__section">
          <h3 tuiTitle class="match-stats-tab__title">Team Statistics</h3>
          <div class="match-stats-tab__stats-container">
            @for (stat of teamStats(); track stat.label) {
              <div class="match-stats-tab__stat-row">
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-a">
                  {{ stat.teamA }}
                </span>
                <div class="match-stats-tab__stat-label">
                  <span>{{ stat.label }}</span>
                  @if (showProgressBar()) {
                    <div class="match-stats-tab__progress">
                      <progress
                        tuiProgressBar
                        [max]="stat.teamA + stat.teamB"
                        [value]="stat.teamA"
                        class="match-stats-tab__progress-bar"
                        [color]="getProgressColor(stat.teamA, stat.teamB)"
                      ></progress>
                    </div>
                  }
                </div>
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-b">
                  {{ stat.teamB }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="match-stats-tab__section">
          <h3 tuiTitle class="match-stats-tab__title">Offense Statistics</h3>
          <div class="match-stats-tab__stats-container">
            @for (stat of offenseStats(); track stat.label) {
              <div class="match-stats-tab__stat-row">
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-a">
                  {{ stat.teamA }}
                </span>
                <div class="match-stats-tab__stat-label">
                  <span>{{ stat.label }}</span>
                  @if (showProgressBar()) {
                    <div class="match-stats-tab__progress">
                      <progress
                        tuiProgressBar
                        [max]="stat.teamA + stat.teamB"
                        [value]="stat.teamA"
                        class="match-stats-tab__progress-bar"
                        [color]="getProgressColor(stat.teamA, stat.teamB)"
                      ></progress>
                    </div>
                  }
                </div>
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-b">
                  {{ stat.teamB }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="match-stats-tab__section">
          <h3 tuiTitle class="match-stats-tab__title">Quarterback Statistics</h3>
          <div class="match-stats-tab__stats-container">
            @for (stat of qbStats(); track stat.label) {
              <div class="match-stats-tab__stat-row">
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-a">
                  {{ stat.teamA }}
                </span>
                <div class="match-stats-tab__stat-label">
                  <span>{{ stat.label }}</span>
                  @if (showProgressBar()) {
                    <div class="match-stats-tab__progress">
                      <progress
                        tuiProgressBar
                        [max]="stat.teamA + stat.teamB"
                        [value]="stat.teamA"
                        class="match-stats-tab__progress-bar"
                        [color]="getProgressColor(stat.teamA, stat.teamB)"
                      ></progress>
                    </div>
                  }
                </div>
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-b">
                  {{ stat.teamB }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="match-stats-tab__section">
          <h3 tuiTitle class="match-stats-tab__title">Defense Statistics</h3>
          <div class="match-stats-tab__stats-container">
            @for (stat of defenseStats(); track stat.label) {
              <div class="match-stats-tab__stat-row">
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-a">
                  {{ stat.teamA }}
                </span>
                <div class="match-stats-tab__stat-label">
                  <span>{{ stat.label }}</span>
                  @if (showProgressBar()) {
                    <div class="match-stats-tab__progress">
                      <progress
                        tuiProgressBar
                        [max]="stat.teamA + stat.teamB"
                        [value]="stat.teamA"
                        class="match-stats-tab__progress-bar"
                        [color]="getProgressColor(stat.teamA, stat.teamB)"
                      ></progress>
                    </div>
                  }
                </div>
                <span class="match-stats-tab__stat-value match-stats-tab__stat-value--team-b">
                  {{ stat.teamB }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="match-stats-tab__loading">
        <tui-icon icon="@tui.refresh" class="match-stats-tab__loading-icon" />
        <p>Loading statistics...</p>
      </div>
    }
  `,
  styleUrl: './match-stats-tab.component.less',
})
export class MatchStatsTabComponent implements OnInit {
  comprehensiveData = input<ComprehensiveMatchData | null>(null);
  private matchStore = inject(MatchStoreService);

  stats = signal<MatchStats | null>(null);
  showProgressBar = signal(true);

  teamATitle = computed(() => this.comprehensiveData()?.teams.team_a.title || 'Team A');
  teamBTitle = computed(() => this.comprehensiveData()?.teams.team_b.title || 'Team B');

  teamStats = computed<StatRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];
    const teamA = stats.team_a.team_stats;
    const teamB = stats.team_b.team_stats;
    return [
      { label: 'Offence Yards', teamA: teamA?.offence_yards || 0, teamB: teamB?.offence_yards || 0 },
      { label: 'Pass Attempts', teamA: teamA?.pass_att || 0, teamB: teamB?.pass_att || 0 },
      { label: 'Run Attempts', teamA: teamA?.run_att || 0, teamB: teamB?.run_att || 0 },
      { label: 'Avg Yards/Att', teamA: teamA?.avg_yards_per_att || 0, teamB: teamB?.avg_yards_per_att || 0 },
      { label: 'Pass Yards', teamA: teamA?.pass_yards || 0, teamB: teamB?.pass_yards || 0 },
      { label: 'Run Yards', teamA: teamA?.run_yards || 0, teamB: teamB?.run_yards || 0 },
      { label: 'Lost Yards', teamA: teamA?.lost_yards || 0, teamB: teamB?.lost_yards || 0 },
      { label: 'Flag Yards', teamA: teamA?.flag_yards || 0, teamB: teamB?.flag_yards || 0 },
      { label: '3rd Down Attempts', teamA: teamA?.third_down_attempts || 0, teamB: teamB?.third_down_attempts || 0 },
      { label: '3rd Down Conversions', teamA: teamA?.third_down_conversions || 0, teamB: teamB?.third_down_conversions || 0 },
      { label: '4th Down Attempts', teamA: teamA?.fourth_down_attempts || 0, teamB: teamB?.fourth_down_attempts || 0 },
      { label: '4th Down Conversions', teamA: teamA?.fourth_down_conversions || 0, teamB: teamB?.fourth_down_conversions || 0 },
      { label: 'First Downs', teamA: teamA?.first_down_gained || 0, teamB: teamB?.first_down_gained || 0 },
      { label: 'Turnovers', teamA: teamA?.turnovers || 0, teamB: teamB?.turnovers || 0 },
    ];
  });

  offenseStats = computed<StatRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];
    const teamA = stats.team_a.offense_stats;
    const teamB = stats.team_b.offense_stats;
    return [
      { label: 'Pass Attempts', teamA: teamA?.pass_attempts || 0, teamB: teamB?.pass_attempts || 0 },
      { label: 'Pass Received', teamA: teamA?.pass_received || 0, teamB: teamB?.pass_received || 0 },
      { label: 'Pass Yards', teamA: teamA?.pass_yards || 0, teamB: teamB?.pass_yards || 0 },
      { label: 'Pass TD', teamA: teamA?.pass_td || 0, teamB: teamB?.pass_td || 0 },
      { label: 'Run Attempts', teamA: teamA?.run_attempts || 0, teamB: teamB?.run_attempts || 0 },
      { label: 'Run Yards', teamA: teamA?.run_yards || 0, teamB: teamB?.run_yards || 0 },
      { label: 'Run Avg', teamA: teamA?.run_avr || 0, teamB: teamB?.run_avr || 0 },
      { label: 'Run TD', teamA: teamA?.run_td || 0, teamB: teamB?.run_td || 0 },
      { label: 'Fumbles', teamA: teamA?.fumble || 0, teamB: teamB?.fumble || 0 },
    ];
  });

  qbStats = computed<StatRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];
    const teamA = stats.team_a.qb_stats;
    const teamB = stats.team_b.qb_stats;
    return [
      { label: 'Passes', teamA: teamA?.passes || 0, teamB: teamB?.passes || 0 },
      { label: 'Passes Completed', teamA: teamA?.passes_completed || 0, teamB: teamB?.passes_completed || 0 },
      { label: 'Pass Yards', teamA: teamA?.pass_yards || 0, teamB: teamB?.pass_yards || 0 },
      { label: 'Pass TD', teamA: teamA?.pass_td || 0, teamB: teamB?.pass_td || 0 },
      { label: 'Pass Avg', teamA: teamA?.pass_avr || 0, teamB: teamB?.pass_avr || 0 },
      { label: 'Run Attempts', teamA: teamA?.run_attempts || 0, teamB: teamB?.run_attempts || 0 },
      { label: 'Run Yards', teamA: teamA?.run_yards || 0, teamB: teamB?.run_yards || 0 },
      { label: 'Run TD', teamA: teamA?.run_td || 0, teamB: teamB?.run_td || 0 },
      { label: 'Run Avg', teamA: teamA?.run_avr || 0, teamB: teamB?.run_avr || 0 },
      { label: 'Fumbles', teamA: teamA?.fumble || 0, teamB: teamB?.fumble || 0 },
      { label: 'Interceptions', teamA: teamA?.interception || 0, teamB: teamB?.interception || 0 },
      { label: 'QB Rating', teamA: teamA?.qb_rating || 0, teamB: teamB?.qb_rating || 0 },
    ];
  });

  defenseStats = computed<StatRow[]>(() => {
    const stats = this.stats();
    if (!stats) return [];
    const teamA = stats.team_a.defense_stats;
    const teamB = stats.team_b.defense_stats;
    return [
      { label: 'Tackles', teamA: teamA?.tackles || 0, teamB: teamB?.tackles || 0 },
      { label: 'Assist Tackles', teamA: teamA?.assist_tackles || 0, teamB: teamB?.assist_tackles || 0 },
      { label: 'Sacks', teamA: teamA?.sacks || 0, teamB: teamB?.sacks || 0 },
      { label: 'Interceptions', teamA: teamA?.interceptions || 0, teamB: teamB?.interceptions || 0 },
      { label: 'Fumble Recoveries', teamA: teamA?.fumble_recoveries || 0, teamB: teamB?.fumble_recoveries || 0 },
      { label: 'Flags', teamA: teamA?.flags || 0, teamB: teamB?.flags || 0 },
    ];
  });

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

  getProgressColor(teamA: number, teamB: number): string {
    const total = teamA + teamB;
    if (total === 0) return 'var(--tui-chart-categorical-01)';
    const ratio = teamA / total;
    if (ratio > 0.6) return 'var(--tui-chart-categorical-01)';
    if (ratio < 0.4) return 'var(--tui-chart-categorical-08)';
    return 'var(--tui-chart-categorical-03)';
  }
}
