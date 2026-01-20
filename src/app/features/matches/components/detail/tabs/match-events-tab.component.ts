import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-match-events-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TuiBadge, TuiIcon, TuiTitle],
  template: `
    @if (comprehensiveData()) {
      <div class="match-events-tab">
        <h3 tuiTitle class="match-events-tab__title">Match Events</h3>
        @if (events().length === 0) {
          <div class="match-events-tab__empty">
            <tui-icon icon="@tui.info" class="match-events-tab__empty-icon" />
            <p>No events recorded</p>
          </div>
        } @else {
          <div class="match-events-tab__table-wrapper">
            <table class="match-events-tab__table">
              <thead>
                <tr>
                  <th>Qtr</th>
                  <th>Event</th>
                  <th>Down</th>
                  <th>Distance</th>
                  <th>Type</th>
                  <th>Result</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                @for (event of events(); track event.id) {
                  <tr class="match-events-tab__row">
                    <td>
                      <tui-badge appearance="accent" size="s">
                        {{ event.event_qtr || '-' }}
                      </tui-badge>
                    </td>
                    <td>
                      <span class="match-events-tab__event-number">
                        {{ event.event_number || '-' }}
                      </span>
                    </td>
                    <td>{{ event.event_down || '-' }}</td>
                    <td>{{ event.event_distance || '-' }}</td>
                    <td>
                      <tui-badge [appearance]="getPlayTypeBadgeAppearance(event.play_type)" size="s" class="match-events-tab__play-type-badge">
                        {{ event.play_type || '-' }}
                      </tui-badge>
                    </td>
                    <td>
                      <tui-badge [appearance]="getResultBadgeAppearance(event.play_result)" size="s" class="match-events-tab__result-badge">
                        {{ event.play_result || '-' }}
                      </tui-badge>
                    </td>
                    <td>
                      <span class="match-events-tab__score" [class.match-events-tab__score--positive]="isScorePositive(event.score_result)">
                        {{ event.score_result || '-' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    } @else {
      <div class="match-events-tab__loading">
        <tui-icon icon="@tui.refresh" class="match-events-tab__loading-icon" />
        <p>Loading events...</p>
      </div>
    }
  `,
  styleUrl: './match-events-tab.component.less',
})
export class MatchEventsTabComponent {
  comprehensiveData = input<ComprehensiveMatchData | null>(null);

  events = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    return data.events || [];
  });

  getPlayTypeBadgeAppearance(playType: string | null | undefined): string {
    if (!playType) return 'neutral';
    const type = playType.toLowerCase();
    if (type.includes('pass')) return 'primary';
    if (type.includes('run') || type.includes('rush')) return 'accent';
    if (type.includes('kick') || type.includes('punt') || type.includes('field goal')) return 'info';
    if (type.includes('turnover') || type.includes('fumble') || type.includes('interception')) return 'negative';
    return 'neutral';
  }

  getResultBadgeAppearance(result: string | null | undefined): string {
    if (!result) return 'neutral';
    const res = result.toLowerCase();
    if (res.includes('touchdown') || res.includes('td')) return 'positive';
    if (res.includes('field goal') || res.includes('fg')) return 'primary';
    if (res.includes('incomplete')) return 'warning';
    if (res.includes('interception') || res.includes('fumble') || res.includes('turnover')) return 'negative';
    return 'neutral';
  }

  isScorePositive(scoreResult: string | null | undefined): boolean {
    if (!scoreResult) return false;
    return scoreResult.toLowerCase().includes('touchdown') || 
           scoreResult.toLowerCase().includes('field goal') ||
           scoreResult.toLowerCase().includes('fg');
  }
}
