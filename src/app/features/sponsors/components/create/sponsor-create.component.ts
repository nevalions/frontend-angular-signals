import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { SponsorStoreService } from '../../services/sponsor-store.service';
import { SponsorCreate, SponsorLogoUploadResponse } from '../../models/sponsor.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { API_BASE_URL, buildStaticUrl } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-sponsor-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, ImageUploadComponent],
  templateUrl: './sponsor-create.component.html',
  styleUrl: './sponsor-create.component.less',
})
export class SponsorCreateComponent {
  private sponsorStore = inject(SponsorStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  sponsorForm = this.fb.group({
    title: ['', [Validators.required]],
    scale_logo: [null as number | null],
  });

  logoUploadLoading = signal(false);
  logoPreviewUrls = signal<ImageUrls | null>(null);

  onLogoUpload(file: File): void {
    this.logoUploadLoading.set(true);
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
  }

  onSubmit(): void {
    if (this.sponsorForm.invalid) return;

    const formData = this.sponsorForm.value;
    const logoUrls = this.logoPreviewUrls();
    const scaleValue = formData.scale_logo;

    const data: SponsorCreate = {
      title: formData.title as string,
      scale_logo: scaleValue === null || scaleValue === undefined ? null : Number(scaleValue),
    };

    if (logoUrls) {
      data.logo_url = logoUrls.original.replace(`${API_BASE_URL}/`, '');
    }

    withCreateAlert(
      this.alerts,
      () => this.sponsorStore.createSponsor(data),
      () => this.cancel(),
      'Sponsor'
    );
  }

  cancel(): void {
    this.navigationHelper.toSponsorsList();
  }
}
