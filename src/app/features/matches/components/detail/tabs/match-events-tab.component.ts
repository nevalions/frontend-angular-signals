import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';

@Component({
  selector: 'app-match-events-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (comprehensiveData()) {
      <div class="match-events-tab">
        @if (events().length === 0) {
          <div class="match-events-tab__empty">No events recorded</div>
        } @else {
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
                  <td>{{ event.event_qtr || '-' }}</td>
                  <td>{{ event.event_number || '-' }}</td>
                  <td>{{ event.event_down || '-' }}</td>
                  <td>{{ event.event_distance || '-' }}</td>
                  <td>{{ event.play_type || '-' }}</td>
                  <td>{{ event.play_result || '-' }}</td>
                  <td>{{ event.score_result || '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    } @else {
      <div class="match-events-tab__loading">Loading events...</div>
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
}
