import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createNumberParamSignal } from '../../../../core/utils/route-param-helper.util';
import { ScoreboardStoreService } from '../../services/scoreboard-store.service';
import { ComprehensiveMatchData } from '../../../matches/models/comprehensive-match.model';
import { GameClock } from '../../../matches/models/gameclock.model';
import { PlayClock } from '../../../matches/models/playclock.model';
import { ScoreboardDisplayComponent } from '../../components/display/scoreboard-display.component';
import { FootballStartRosterDisplayComponent } from '../../components/roster-display/football-start-roster-display/football-start-roster-display.component';

@Component({
  selector: 'app-scoreboard-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScoreboardDisplayComponent, FootballStartRosterDisplayComponent],
  templateUrl: './scoreboard-view.component.html',
  styleUrl: './scoreboard-view.component.less',
})
export class ScoreboardViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private scoreboardStore = inject(ScoreboardStoreService);

  matchId = createNumberParamSignal(this.route, 'matchId');

  // Data signals
  protected readonly data = signal<ComprehensiveMatchData | null>(null);
  protected readonly gameClock = signal<GameClock | null>(null);
  protected readonly playClock = signal<PlayClock | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Computed values
  protected readonly gameClockSeconds = computed(() => this.gameClock()?.gameclock ?? 0);
  protected readonly playClockSeconds = computed(() => this.playClock()?.playclock ?? null);

  // Tournament logo/sponsor (would come from tournament data)
  protected readonly tournamentLogo = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.tournament_logo_web_url || null;
  });

  protected readonly tournamentSponsorLogo = computed(() => {
    const d = this.data();
    return d?.match?.tournament?.main_sponsor?.logo_url || null;
  });

  ngOnInit(): void {
    this.loadData();
    // TODO: Setup WebSocket connection for real-time updates
  }

  private loadData(): void {
    const id = this.matchId();
    if (!id) {
      this.error.set('Invalid match ID');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Load comprehensive match data
    this.scoreboardStore.getComprehensiveMatchData(id).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load match data');
        this.loading.set(false);
      },
    });

    // Load game clock
    this.scoreboardStore.getGameClock(id).subscribe({
      next: (clock) => this.gameClock.set(clock),
      error: () => console.error('Failed to load game clock'),
    });

    // Load play clock
    this.scoreboardStore.getPlayClock(id).subscribe({
      next: (clock) => this.playClock.set(clock),
      error: () => console.error('Failed to load play clock'),
    });
  }
}
