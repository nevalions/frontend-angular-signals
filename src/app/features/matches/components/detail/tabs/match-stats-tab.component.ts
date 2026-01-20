import { ChangeDetectionStrategy, Component, input, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchStoreService } from '../../../services/match-store.service';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { MatchStats } from '../../../models/match-stats.model';

@Component({
  selector: 'app-match-stats-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (comprehensiveData()) {
      <div class="match-stats-tab">
        <div class="match-stats-tab__section">
          <h3 class="match-stats-tab__title">Team Statistics</h3>
          <table class="match-stats-tab__table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>{{ teamATitle() }}</th>
                <th>{{ teamBTitle() }}</th>
              </tr>
            </thead>
            <tbody>
              @for (stat of teamStats(); track stat.label) {
                <tr>
                  <td class="match-stats-tab__label">{{ stat.label }}</td>
                  <td>{{ stat.teamA }}</td>
                  <td>{{ stat.teamB }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="match-stats-tab__section">
          <h3 class="match-stats-tab__title">Offense Statistics</h3>
          <table class="match-stats-tab__table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>{{ teamATitle() }}</th>
                <th>{{ teamBTitle() }}</th>
              </tr>
            </thead>
            <tbody>
              @for (stat of offenseStats(); track stat.label) {
                <tr>
                  <td class="match-stats-tab__label">{{ stat.label }}</td>
                  <td>{{ stat.teamA }}</td>
                  <td>{{ stat.teamB }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="match-stats-tab__section">
          <h3 class="match-stats-tab__title">Quarterback Statistics</h3>
          <table class="match-stats-tab__table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>{{ teamATitle() }}</th>
                <th>{{ teamBTitle() }}</th>
              </tr>
            </thead>
            <tbody>
              @for (stat of qbStats(); track stat.label) {
                <tr>
                  <td class="match-stats-tab__label">{{ stat.label }}</td>
                  <td>{{ stat.teamA }}</td>
                  <td>{{ stat.teamB }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="match-stats-tab__section">
          <h3 class="match-stats-tab__title">Defense Statistics</h3>
          <table class="match-stats-tab__table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>{{ teamATitle() }}</th>
                <th>{{ teamBTitle() }}</th>
              </tr>
            </thead>
            <tbody>
              @for (stat of defenseStats(); track stat.label) {
                <tr>
                  <td class="match-stats-tab__label">{{ stat.label }}</td>
                  <td>{{ stat.teamA }}</td>
                  <td>{{ stat.teamB }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    } @else {
      <div class="match-stats-tab__loading">Loading statistics...</div>
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

  teamStats = computed(() => {
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

  offenseStats = computed(() => {
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

  qbStats = computed(() => {
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

  defenseStats = computed(() => {
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
}
