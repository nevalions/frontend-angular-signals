import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import { SponsorLogoUploadResponse, SponsorUpdate } from '../../models/sponsor.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { API_BASE_URL, buildStaticUrl } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-sponsor-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, ImageUploadComponent],
  templateUrl: './sponsor-edit.component.html',
  styleUrl: './sponsor-edit.component.less',
})
export class SponsorEditComponent {
  private sponsorStore = inject(SponsorStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  sponsorForm = this.fb.group({
    title: ['', [Validators.required]],
    scale_logo: [null as number | null],
  });

  sponsorId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const value = params.get('id');
      return value ? Number(value) : null;
    })),
    { initialValue: null }
  );

  sponsor = computed(() => {
    const id = this.sponsorId();
    if (!id) return null;
    return this.sponsorStore.sponsors().find((item) => item.id === id) || null;
  });

  loading = computed(() => this.sponsorStore.loading());

  logoUploadLoading = signal(false);
  logoPreviewUrls = signal<ImageUrls | null>(null);
  logoRemoved = signal(false);

  currentLogoUrls = computed<ImageUrls | null>(() => {
    const sponsor = this.sponsor();
    if (!sponsor || !sponsor.logo_url) return null;
    return {
      original: buildStaticUrl(sponsor.logo_url),
    };
  });

  displayLogoUrls = computed(() => this.logoPreviewUrls() ?? this.currentLogoUrls());

  private patchFormOnSponsorChange = effect(() => {
    const sponsor = this.sponsor();
    if (sponsor) {
      this.sponsorForm.patchValue({
        title: sponsor.title,
        scale_logo: sponsor.scale_logo ?? null,
      });
    }
  });

  onLogoUpload(file: File): void {
    this.logoUploadLoading.set(true);
    this.logoRemoved.set(false);
    this.sponsorStore.uploadSponsorLogo(file).subscribe({
      next: (response: SponsorLogoUploadResponse) => {
        this.logoPreviewUrls.set({
          original: buildStaticUrl(response.logoUrl),
        });
        this.logoUploadLoading.set(false);
      },
      error: () => {
        this.logoUploadLoading.set(false);
      },
    });
  }

  onLogoRemove(): void {
    this.logoPreviewUrls.set(null);
    this.logoRemoved.set(true);
  }

  onSubmit(): void {
    if (this.sponsorForm.invalid) return;
    const id = this.sponsorId();
    if (!id) return;

    const formData = this.sponsorForm.value;
    const newLogoUrls = this.logoPreviewUrls();
    const scaleValue = formData.scale_logo;

    const data: SponsorUpdate = {
      title: formData.title as string,
      scale_logo: scaleValue === null || scaleValue === undefined ? null : Number(scaleValue),
    };

    if (newLogoUrls) {
      data.logo_url = newLogoUrls.original.replace(`${API_BASE_URL}/`, '');
    } else if (this.logoRemoved()) {
      data.logo_url = null;
    }

    withUpdateAlert(
      this.alerts,
      () => this.sponsorStore.updateSponsor(id, data),
      () => this.navigateToDetail(),
      'Sponsor'
    );
  }

  navigateToDetail(): void {
    const sponsorId = this.sponsorId();
    if (sponsorId) {
      this.navigationHelper.toSponsorDetail(sponsorId);
    }
  }
}
