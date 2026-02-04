import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { of } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import { buildStaticUrl } from '../../../../core/config/api.constants';
import { TuiAlertService, TuiDialogService, TuiLoader } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-sponsor-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EntityHeaderComponent, TuiAvatar, TuiBadge, TuiCardLarge, TuiCell, TuiLoader],
  templateUrl: './sponsor-detail.component.html',
  styleUrl: './sponsor-detail.component.less',
})
export class SponsorDetailComponent {
  private route = inject(ActivatedRoute);
  private sponsorStore = inject(SponsorStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  sponsorId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  sponsor = computed(() => {
    const id = this.sponsorId();
    if (!id) return null;
    return this.sponsorStore.sponsors().find((sponsor) => sponsor.id === id) || null;
  });

  loading = this.sponsorStore.loading;

  logoUrl = computed(() => {
    const sponsor = this.sponsor();
    return sponsor?.logo_url ? buildStaticUrl(sponsor.logo_url) : null;
  });

  logoScale = computed(() => this.sponsor()?.scale_logo ?? 1);

  connectedSponsorLinesResource = rxResource({
    params: computed(() => ({
      sponsorId: this.sponsorId(),
      sponsorLines: this.sponsorStore.sponsorLines(),
    })),
    stream: ({ params }) => {
      if (!params.sponsorId || params.sponsorLines.length === 0) {
        return of([]);
      }
      return this.sponsorStore.getSponsorLineConnections(params.sponsorId, params.sponsorLines);
    },
  });

  connectedSponsorLines = computed(() => this.connectedSponsorLinesResource.value() ?? []);
  connectedSponsorLinesLoading = computed(() => this.connectedSponsorLinesResource.isLoading());

  navigateBack(): void {
    this.navigationHelper.toSponsorsList();
  }

  onEdit(): void {
    const sponsorId = this.sponsorId();
    if (sponsorId) {
      this.navigationHelper.toSponsorEdit(sponsorId);
    }
  }

  onDelete(): void {
    const sponsor = this.sponsor();
    const sponsorId = this.sponsorId();
    if (!sponsor || !sponsorId) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete sponsor "${sponsor.title}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.sponsorStore.deleteSponsorWithConnections(sponsorId, this.connectedSponsorLines()),
      () => this.navigateBack(),
      'Sponsor'
    );
  }
}
