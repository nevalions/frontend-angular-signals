import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, of } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import type { SponsorLineUpdate } from '../../models/sponsor-line.model';

@Component({
  selector: 'app-sponsor-line-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './sponsor-line-edit.component.html',
  styleUrl: './sponsor-line-edit.component.less',
})
export class SponsorLineEditComponent {
  private sponsorStore = inject(SponsorStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  sponsorLineForm = this.fb.group({
    title: ['', [Validators.required]],
    is_visible: [false],
  });

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

  private patchFormOnSponsorLineChange = effect(() => {
    const sponsorLine = this.sponsorLine();
    if (sponsorLine) {
      this.sponsorLineForm.patchValue({
        title: sponsorLine.title ?? '',
        is_visible: sponsorLine.is_visible ?? false,
      });
    }
  });

  onSubmit(): void {
    if (this.sponsorLineForm.invalid) return;
    const id = this.sponsorLineId();
    if (!id) return;

    const formData = this.sponsorLineForm.value;

    const data: SponsorLineUpdate = {
      title: formData.title as string,
      is_visible: formData.is_visible ?? null,
    };

    withUpdateAlert(
      this.alerts,
      () => this.sponsorStore.updateSponsorLine(id, data),
      () => this.navigateToDetail(),
      'Sponsor Line'
    );
  }

  navigateToDetail(): void {
    const sponsorLineId = this.sponsorLineId();
    if (sponsorLineId) {
      this.navigationHelper.toSponsorLineDetail(sponsorLineId);
    }
  }
}
