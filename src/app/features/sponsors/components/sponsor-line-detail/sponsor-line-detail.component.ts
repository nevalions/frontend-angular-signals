import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, map, of } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiAppearance, TuiDialogService, TuiLoader, TuiTextfield, tuiItemsHandlersProvider } from '@taiga-ui/core';
import { TuiBadge, TuiChevron, TuiMultiSelect } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';
import { EntityHeaderComponent } from '../../../../shared/components/entity-header/entity-header.component';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withDeleteConfirm, withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import { SponsorDisplayFlatComponent } from '../../../scoreboard/components/sponsor-display/sponsor-display-flat.component';
import type { Sponsor } from '../../models/sponsor.model';
import type { SponsorLine } from '../../models/sponsor-line.model';
import type { Sponsor as SharedSponsor, SponsorLine as SharedSponsorLine } from '../../../../shared/types';

type SponsorLineSponsor = { sponsor: Sponsor; position: number | null };

@Component({
  selector: 'app-sponsor-line-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EntityHeaderComponent,
    FormsModule,
    TuiBadge,
    TuiCardLarge,
    TuiCell,
    TuiChevron,
    TuiLoader,
    TuiAppearance,
    TuiMultiSelect,
    TuiTextfield,
    SponsorDisplayFlatComponent,
  ],
  providers: [
    tuiItemsHandlersProvider<Sponsor>({
      stringify: signal((item) => item.title || `Sponsor #${item.id}`),
      identityMatcher: signal((a, b) => a.id === b.id),
    }),
  ],
  templateUrl: './sponsor-line-detail.component.html',
  styleUrl: './sponsor-line-detail.component.less',
})
export class SponsorLineDetailComponent {
  private route = inject(ActivatedRoute);
  private sponsorStore = inject(SponsorStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private dialogs = inject(TuiDialogService);
  private alerts = inject(TuiAlertService);

  sponsorLineId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const value = params.get('id');
      return value ? Number(value) : null;
    })),
    { initialValue: null }
  );

  sponsorLineResource = rxResource({
    params: computed(() => ({ sponsorLineId: this.sponsorLineId() })),
    stream: ({ params }) => {
      if (!params.sponsorLineId) {
        return of(null);
      }
      return this.sponsorStore.getSponsorLineById(params.sponsorLineId);
    },
  });

  sponsorLine = computed(() => this.sponsorLineResource.value());
  loading = computed(() => this.sponsorLineResource.isLoading());
  sponsors = this.sponsorStore.sponsors;

  sponsorConnectionsResource = rxResource({
    params: computed(() => ({ sponsorLineId: this.sponsorLineId() })),
    stream: ({ params }) => {
      if (!params.sponsorLineId) {
        return of({ sponsor_line: null, sponsors: [] });
      }
      return this.sponsorStore.getSponsorsInSponsorLine(params.sponsorLineId);
    },
  });

  connectedSponsors = computed<SponsorLineSponsor[]>(
    () => this.sponsorConnectionsResource.value()?.sponsors ?? []
  );
  connectedSponsorsLoading = computed(() => this.sponsorConnectionsResource.isLoading());
  previewSponsors = computed<SharedSponsor[]>(() => {
    const allSponsors = this.sponsors();
    return [...this.connectedSponsors()]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((entry) => {
        const connected = entry.sponsor;
        const full = allSponsors.find((sponsor) => sponsor.id === connected.id) ?? connected;
        return {
          ...full,
          title: full.title ?? '',
        };
      });
  });

  previewLine = computed<SharedSponsorLine | null>(() => {
    const line = this.sponsorLine();
    if (!line) return null;
    return {
      id: line.id,
      title: line.title ?? '',
      is_visible: true,
    };
  });

  private selectedSponsorsSignal = signal<Sponsor[]>([]);
  private selectionSyncing = signal(false);

  get selectedSponsorsValue(): Sponsor[] {
    return this.selectedSponsorsSignal();
  }

  set selectedSponsorsValue(value: Sponsor[]) {
    this.selectedSponsorsSignal.set(value ?? []);
  }

  private syncSelection = effect(() => {
    const connected = this.connectedSponsors().map((entry) => entry.sponsor);
    this.selectionSyncing.set(true);
    this.selectedSponsorsSignal.set(connected);
    this.selectionSyncing.set(false);
  });

  visibilityLabel(line: SponsorLine): string {
    return line.is_visible ? 'Visible' : 'Hidden';
  }

  onSponsorsSelectionChange(nextSelection: Sponsor[] | null): void {
    if (this.selectionSyncing()) return;
    const sponsorLineId = this.sponsorLineId();
    if (!sponsorLineId) return;

    const previous = this.selectedSponsorsSignal();
    const safeSelection = nextSelection ?? [];
    this.selectedSponsorsSignal.set(safeSelection);
    const nextIds = new Set(safeSelection.map((sponsor) => sponsor.id));
    const previousIds = new Set(previous.map((sponsor) => sponsor.id));

    const added = safeSelection.filter((sponsor) => !previousIds.has(sponsor.id));
    const removed = previous.filter((sponsor) => !nextIds.has(sponsor.id));

    if (added.length === 0 && removed.length === 0) return;

    const operations = [
      ...added.map((sponsor) => this.sponsorStore.addSponsorToLine(sponsor.id, sponsorLineId)),
      ...removed.map((sponsor) => this.sponsorStore.removeSponsorFromLine(sponsor.id, sponsorLineId)),
    ];

    withUpdateAlert(
      this.alerts,
      () => forkJoin(operations),
      () => {
        this.sponsorConnectionsResource.reload();
      },
      'Sponsor line sponsors'
    );
  }

  navigateBack(): void {
    this.navigationHelper.toSponsorLinesList();
  }

  onEdit(): void {
    const sponsorLineId = this.sponsorLineId();
    if (sponsorLineId) {
      this.navigationHelper.toSponsorLineEdit(sponsorLineId);
    }
  }

  onDelete(): void {
    const sponsorLine = this.sponsorLine();
    const sponsorLineId = this.sponsorLineId();
    if (!sponsorLine || !sponsorLineId) return;

    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete sponsor line "${sponsorLine.title || 'Sponsor Line'}"?`,
        content: 'This action cannot be undone!',
      },
      () => this.sponsorStore.deleteSponsorLineWithConnections(sponsorLineId),
      () => this.navigateBack(),
      'Sponsor Line'
    );
  }
}
