import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiPagination } from '@taiga-ui/kit';
import { MatchStoreService } from '../../../../matches/services/match-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { MatchWithDetails } from '../../../../matches/models/match.model';
import { buildStaticUrl } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-tournament-matches-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiCardLarge,
    TuiCell,
    TuiPagination
  ],
  templateUrl: './tournament-matches-tab.component.html',
  styleUrl: './tournament-matches-tab.component.less',
})
export class TournamentMatchesTabComponent {
  private matchStore = inject(MatchStoreService);
  private navigationHelper = inject(NavigationHelperService);

  tournamentId = input.required<number>();
  sportId = input.required<number>();
  year = input.required<number | null>();

  matchesLoading = signal(false);
  matchesError = signal<string | null>(null);
  matchesCurrentPage = signal(1);
  matchesItemsPerPage = signal(10);
  matchesTotalCount = signal(0);
  matchesTotalPages = signal(0);

  matches = signal<MatchWithDetails[]>([]);
  matchesSearch = signal('');
  matchesWeek = signal<number | null>(null);

  matchesSortOrder = signal<'asc' | 'desc'>('asc');

  readonly itemsPerPageOptions = [10, 20, 50];

  private loadMatchesOnTournamentChange = effect(() => {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.loadMatches();
    }
  });

  loadMatches(): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.matchesLoading.set(true);
    this.matchesError.set(null);

    this.matchStore.getTournamentMatchesPaginated(
      tournamentId,
      this.matchesCurrentPage(),
      this.matchesItemsPerPage(),
      this.matchesSortOrder() === 'asc',
      this.matchesSearch(),
      this.matchesWeek()
    ).subscribe({
      next: (response) => {
        this.matches.set(response.data || []);
        this.matchesTotalCount.set(response.metadata?.total_items || 0);
        this.matchesTotalPages.set(response.metadata?.total_pages || 0);
        this.matchesLoading.set(false);
      },
      error: () => {
        this.matchesError.set('Failed to load matches');
        this.matchesLoading.set(false);
      }
    });
  }

  onMatchesSearchChange(query: string): void {
    this.matchesSearch.set(query);
    this.matchesCurrentPage.set(1);
  }

  clearMatchesSearch(): void {
    this.matchesSearch.set('');
    this.matchesCurrentPage.set(1);
  }

  onMatchesWeekChange(week: number | null): void {
    this.matchesWeek.set(week);
    this.matchesCurrentPage.set(1);
    this.loadMatches();
  }

  onMatchesWeekInputChange(value: string): void {
    const week = value ? Number(value) : null;
    this.onMatchesWeekChange(week);
  }

  clearWeekFilter(): void {
    this.matchesWeek.set(null);
    this.matchesCurrentPage.set(1);
    this.loadMatches();
  }

  onMatchesPageChange(pageIndex: number): void {
    this.matchesCurrentPage.set(pageIndex + 1);
    this.loadMatches();
  }

  onMatchesItemsPerPageChange(itemsPerPage: number): void {
    this.matchesItemsPerPage.set(itemsPerPage);
    this.matchesCurrentPage.set(1);
    this.loadMatches();
  }

  toggleMatchesSort(): void {
    this.matchesSortOrder.set(this.matchesSortOrder() === 'asc' ? 'desc' : 'asc');
    this.matchesCurrentPage.set(1);
    this.loadMatches();
  }

  navigateToMatchDetail(matchId: number): void {
    const sportId = this.sportId();
    const year = this.year();
    const tournamentId = this.tournamentId();
    if (sportId && tournamentId) {
      this.navigationHelper.toMatchDetail(sportId, matchId, year || undefined, tournamentId);
    }
  }

  formatMatchDate(date: string | null | undefined): string {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatMatchTime(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  teamLogoUrl(logoPath: string | null): string {
    return logoPath ? buildStaticUrl(logoPath) : '';
  }
}
