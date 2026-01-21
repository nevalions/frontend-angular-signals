import { ChangeDetectionStrategy, Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprehensiveMatchData } from '../../../models/comprehensive-match.model';
import { TuiBadge, TuiChip, TuiStatus, TuiSegmented } from '@taiga-ui/kit';
import { TuiIcon, TuiTitle, TuiAppearance, TuiSurface } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { FormsModule } from '@angular/forms';

interface MatchEvent {
  id: number;
  event_qtr?: number | null;
  event_number?: number | null;
  event_down?: number | null;
  event_distance?: number | null;
  play_type?: string | null;
  play_result?: string | null;
  score_result?: string | null;
}

@Component({
  selector: 'app-match-events-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TuiBadge,
    TuiChip,
    TuiStatus,
    TuiSegmented,
    TuiIcon,
    TuiTitle,
    TuiAppearance,
    TuiSurface,
    TuiCardLarge,
    TuiHeader,
  ],
  template: `
    @if (comprehensiveData()) {
      <div class="match-events-tab">
        <!-- Header with Quarter Filter -->
        <div tuiCardLarge tuiSurface="floating" class="match-events-tab__header-card">
          <header tuiHeader>
            <hgroup tuiTitle>
              <h3>
                <tui-icon icon="@tui.list" class="match-events-tab__header-icon" />
                Match Events
              </h3>
              <p tuiSubtitle>Play-by-play timeline</p>
            </hgroup>
          </header>

          <!-- Quarter Filter Tabs -->
          @if (quarterOptions().length > 1) {
            <div class="match-events-tab__filter-section">
              <tui-segmented
                [activeItemIndex]="selectedQuarterIndex()"
                (activeItemIndexChange)="onQuarterChange($event)"
                class="match-events-tab__quarter-tabs"
              >
                @for (qtr of quarterOptions(); track qtr) {
                  <button type="button">
                    {{ qtr === 0 ? 'All' : 'Q' + qtr }}
                  </button>
                }
              </tui-segmented>
            </div>
          }

          <!-- Stats Summary -->
          <div class="match-events-tab__stats-summary">
            <div class="match-events-tab__stat-item">
              <span class="match-events-tab__stat-value">{{ filteredEvents().length }}</span>
              <span class="match-events-tab__stat-label">Total Plays</span>
            </div>
            <div class="match-events-tab__stat-divider"></div>
            <div class="match-events-tab__stat-item">
              <span class="match-events-tab__stat-value match-events-tab__stat-value--pass">{{ passPlays() }}</span>
              <span class="match-events-tab__stat-label">Pass Plays</span>
            </div>
            <div class="match-events-tab__stat-divider"></div>
            <div class="match-events-tab__stat-item">
              <span class="match-events-tab__stat-value match-events-tab__stat-value--run">{{ runPlays() }}</span>
              <span class="match-events-tab__stat-label">Run Plays</span>
            </div>
            <div class="match-events-tab__stat-divider"></div>
            <div class="match-events-tab__stat-item">
              <span class="match-events-tab__stat-value match-events-tab__stat-value--score">{{ scoringPlays() }}</span>
              <span class="match-events-tab__stat-label">Scoring Plays</span>
            </div>
          </div>
        </div>

        @if (filteredEvents().length === 0) {
          <div class="match-events-tab__empty" tuiSurface="neutral">
            <div class="match-events-tab__empty-content">
              <tui-icon icon="@tui.clipboard-list" class="match-events-tab__empty-icon" />
              <h4>No Events Recorded</h4>
              <p>Play-by-play data will appear here once available</p>
            </div>
          </div>
        } @else {
          <!-- Timeline View -->
          <div class="match-events-tab__timeline">
            @for (event of filteredEvents(); track event.id; let i = $index; let first = $first) {
              @if (first || event.event_qtr !== filteredEvents()[i - 1]?.event_qtr) {
                <div class="match-events-tab__quarter-marker">
                  <div class="match-events-tab__quarter-line"></div>
                  <tui-badge appearance="accent" size="m" class="match-events-tab__quarter-badge">
                    <tui-icon icon="@tui.flag" class="match-events-tab__quarter-icon" />
                    Quarter {{ event.event_qtr || '?' }}
                  </tui-badge>
                  <div class="match-events-tab__quarter-line"></div>
                </div>
              }

              <div
                tuiSurface="floating"
                class="match-events-tab__event-card"
                [class.match-events-tab__event-card--scoring]="isScoringPlay(event)"
                [class.match-events-tab__event-card--turnover]="isTurnover(event)"
              >
                <div class="match-events-tab__event-timeline">
                  <div class="match-events-tab__event-number">
                    {{ event.event_number || '-' }}
                  </div>
                  <div class="match-events-tab__timeline-connector"></div>
                </div>

                <div class="match-events-tab__event-content">
                  <div class="match-events-tab__event-header">
                    <div class="match-events-tab__down-distance">
                      @if (event.event_down && event.event_distance) {
                        <tui-chip size="xs" appearance="neutral">
                          {{ getOrdinal(event.event_down) }} & {{ event.event_distance }}
                        </tui-chip>
                      } @else {
                        <tui-chip size="xs" appearance="neutral">
                          Special Play
                        </tui-chip>
                      }
                    </div>

                    <div class="match-events-tab__play-type">
                      <tui-badge
                        [appearance]="getPlayTypeBadgeAppearance(event.play_type)"
                        size="s"
                        class="match-events-tab__type-badge"
                      >
                        <tui-icon [icon]="getPlayTypeIcon(event.play_type)" class="match-events-tab__type-icon" />
                        {{ event.play_type || 'Unknown' }}
                      </tui-badge>
                    </div>
                  </div>

                  <div class="match-events-tab__event-result">
                    @if (event.play_result) {
                      <div class="match-events-tab__result-text">
                        <tui-badge
                          [appearance]="getResultBadgeAppearance(event.play_result)"
                          size="s"
                          tuiStatus
                        >
                          {{ event.play_result }}
                        </tui-badge>
                      </div>
                    }

                    @if (event.score_result && isScoringPlay(event)) {
                      <div class="match-events-tab__score-highlight">
                        <tui-icon icon="@tui.trophy" class="match-events-tab__score-icon" />
                        <span>{{ event.score_result }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <div class="match-events-tab__loading">
        <div class="match-events-tab__loading-content">
          <tui-icon icon="@tui.loader" class="match-events-tab__loading-icon" />
          <span>Loading events...</span>
        </div>
      </div>
    }
  `,
  styleUrl: './match-events-tab.component.less',
})
export class MatchEventsTabComponent {
  comprehensiveData = input<ComprehensiveMatchData | null>(null);
  selectedQuarter = signal<number>(0); // 0 means all quarters

  events = computed(() => {
    const data = this.comprehensiveData();
    if (!data) return [];
    return (data.events || []) as MatchEvent[];
  });

  quarterOptions = computed(() => {
    const quarters = new Set(this.events().map(e => e.event_qtr).filter(q => q !== null && q !== undefined));
    return [0, ...Array.from(quarters).sort((a, b) => (a || 0) - (b || 0))] as number[];
  });

  selectedQuarterIndex = computed(() => {
    const options = this.quarterOptions();
    const selected = this.selectedQuarter();
    const index = options.indexOf(selected);
    return index >= 0 ? index : 0;
  });

  filteredEvents = computed(() => {
    const quarter = this.selectedQuarter();
    if (quarter === 0) return this.events();
    return this.events().filter(e => e.event_qtr === quarter);
  });

  passPlays = computed(() =>
    this.filteredEvents().filter(e => e.play_type?.toLowerCase().includes('pass')).length
  );

  runPlays = computed(() =>
    this.filteredEvents().filter(e => {
      const type = e.play_type?.toLowerCase() || '';
      return type.includes('run') || type.includes('rush');
    }).length
  );

  scoringPlays = computed(() =>
    this.filteredEvents().filter(e => this.isScoringPlay(e)).length
  );

  onQuarterChange(index: number): void {
    const options = this.quarterOptions();
    this.selectedQuarter.set(options[index] || 0);
  }

  getPlayTypeBadgeAppearance(playType: string | null | undefined): string {
    if (!playType) return 'neutral';
    const type = playType.toLowerCase();
    if (type.includes('pass')) return 'primary';
    if (type.includes('run') || type.includes('rush')) return 'accent';
    if (type.includes('kick') || type.includes('punt') || type.includes('field goal')) return 'info';
    if (type.includes('turnover') || type.includes('fumble') || type.includes('interception')) return 'negative';
    return 'neutral';
  }

  getPlayTypeIcon(playType: string | null | undefined): string {
    if (!playType) return '@tui.circle';
    const type = playType.toLowerCase();
    if (type.includes('pass')) return '@tui.send';
    if (type.includes('run') || type.includes('rush')) return '@tui.trending-up';
    if (type.includes('kick') || type.includes('field goal')) return '@tui.target';
    if (type.includes('punt')) return '@tui.arrow-up';
    if (type.includes('turnover') || type.includes('fumble')) return '@tui.alert-triangle';
    if (type.includes('interception')) return '@tui.shield';
    return '@tui.circle';
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

  isScoringPlay(event: MatchEvent): boolean {
    const result = event.play_result?.toLowerCase() || '';
    const score = event.score_result?.toLowerCase() || '';
    return result.includes('touchdown') || result.includes('td') ||
           result.includes('field goal') || result.includes('fg') ||
           score.includes('touchdown') || score.includes('td') ||
           score.includes('field goal') || score.includes('fg');
  }

  isTurnover(event: MatchEvent): boolean {
    const result = event.play_result?.toLowerCase() || '';
    const type = event.play_type?.toLowerCase() || '';
    return result.includes('interception') || result.includes('fumble') ||
           type.includes('turnover') || type.includes('interception');
  }

  getOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  }
}
