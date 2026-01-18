import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TuiTextfield, TuiButton } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiAvatar, TuiPagination } from '@taiga-ui/kit';
import { TuiIcon } from '@taiga-ui/core';
import { SeasonStoreService } from '../../../../seasons/services/season-store.service';
import { TournamentStoreService } from '../../../../tournaments/services/tournament-store.service';
import { NavigationHelperService } from '../../../../../shared/services/navigation-helper.service';
import { Tournament } from '../../../../tournaments/models/tournament.model';
import { UpperCasePipe } from '@angular/common';
import { buildStaticUrl } from '../../../../../core/config/api.constants';

@Component({
  selector: 'app-sport-tournaments-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    TuiTextfield,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiAvatar,
    TuiPagination,
    TuiIcon
  ],
  templateUrl: './sport-tournaments-tab.component.html',
  styleUrl: './sport-tournaments-tab.component.less',
})
export class SportTournamentsTabComponent {
  private seasonStore = inject(SeasonStoreService);
  private tournamentStore = inject(TournamentStoreService);
  private navigationHelper = inject(NavigationHelperService);

  sportId = input.required<number>();
  selectedSeasonYear = input.required<number | null>();

  searchQuery = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);

  readonly itemsPerPageOptions = [10, 20, 50];

  tournaments = computed(() => {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (!sportId || !year) return [];

    const season = this.seasonStore.seasonByYear().get(year);
    if (!season) return [];

    const key = `${sportId}-${season.id}`;
    const allTournaments = this.tournamentStore.tournamentsBySportAndSeason().get(key) || [];

    const query = this.searchQuery().toLowerCase();
    if (!query) return allTournaments;

    return allTournaments.filter((t: Tournament) =>
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  tournamentLogoUrl(tournament: Tournament): string | null {
    return tournament.tournament_logo_icon_url ? buildStaticUrl(tournament.tournament_logo_icon_url) : null;
  }

  totalCount = computed(() => this.tournaments().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.itemsPerPage()));

  paginatedTournaments = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.tournaments().slice(start, end);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onPageChange(pageIndex: number): void {
    this.currentPage.set(pageIndex + 1);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage.set(itemsPerPage);
    this.currentPage.set(1);
  }

  navigateToTournamentDetail(tournamentId: number): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId && year) {
      this.navigationHelper.toTournamentDetail(sportId, year, tournamentId);
    }
  }

  navigateToAddTournament(): void {
    const sportId = this.sportId();
    const year = this.selectedSeasonYear();
    if (sportId && year) {
      this.navigationHelper.toTournamentCreate(sportId, year);
    }
  }
}
