import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiPagination } from '@taiga-ui/kit';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import type { Sponsor } from '../../models/sponsor.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';

@Component({
  selector: 'app-sponsor-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TuiBadge, TuiButton, TuiCardLarge, TuiCell, TuiLoader, TuiPagination],
  templateUrl: './sponsor-list.component.html',
  styleUrl: './sponsor-list.component.less',
})
export class SponsorListComponent implements OnInit {
  private sponsorStore = inject(SponsorStoreService);
  private navigationHelper = inject(NavigationHelperService);

  sponsors = this.sponsorStore.sponsorsPaginated;
  loading = this.sponsorStore.sponsorsPaginatedLoading;
  error = this.sponsorStore.sponsorsPaginatedError;
  page = this.sponsorStore.sponsorsPage;
  itemsPerPage = this.sponsorStore.sponsorsItemsPerPage;
  totalPages = this.sponsorStore.sponsorsTotalPages;
  totalCount = this.sponsorStore.sponsorsTotalCount;

  readonly itemsPerPageOptions = [10, 20, 50];

  logoUrl(sponsor: Sponsor): string | null {
    return sponsor.logo_url ? buildStaticUrl(sponsor.logo_url) : null;
  }

  logoScale(sponsor: Sponsor): number {
    return sponsor.scale_logo ?? 1;
  }

  ngOnInit(): void {
    this.sponsorStore.reloadSponsorsList();
  }

  onPageChange(pageIndex: number): void {
    this.sponsorStore.setSponsorsPage(pageIndex + 1);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.sponsorStore.setSponsorsItemsPerPage(itemsPerPage);
  }

  navigateToCreate(): void {
    this.navigationHelper.toSponsorCreate();
  }
}
