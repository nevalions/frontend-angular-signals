import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiPagination } from '@taiga-ui/kit';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import type { SponsorLine } from '../../models/sponsor-line.model';

@Component({
  selector: 'app-sponsor-lines-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TuiBadge, TuiCardLarge, TuiCell, TuiLoader, TuiPagination],
  templateUrl: './sponsor-lines-list.component.html',
  styleUrl: './sponsor-lines-list.component.less',
})
export class SponsorLinesListComponent {
  private sponsorStore = inject(SponsorStoreService);

  sponsorLines = this.sponsorStore.sponsorLinesPaginated;
  loading = this.sponsorStore.sponsorLinesPaginatedLoading;
  error = this.sponsorStore.sponsorLinesPaginatedError;
  page = this.sponsorStore.sponsorLinesPage;
  itemsPerPage = this.sponsorStore.sponsorLinesItemsPerPage;
  totalPages = this.sponsorStore.sponsorLinesTotalPages;
  totalCount = this.sponsorStore.sponsorLinesTotalCount;

  readonly itemsPerPageOptions = [10, 20, 50];

  visibilityLabel(line: SponsorLine): string {
    return line.is_visible ? 'Visible' : 'Hidden';
  }

  onPageChange(pageIndex: number): void {
    this.sponsorStore.setSponsorLinesPage(pageIndex + 1);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.sponsorStore.setSponsorLinesItemsPerPage(itemsPerPage);
  }
}
