import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { PersonCreate, PhotoUploadResponse } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withCreateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-person-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './person-create.component.html',
  styleUrl: './person-create.component.less',
})
export class PersonCreateComponent {
  private navigationHelper = inject(NavigationHelperService);
  private personStore = inject(PersonStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  personForm = this.fb.group({
    first_name: ['', [Validators.required]],
    second_name: [''],
    person_eesl_id: [null as number | null],
    person_dob: [''],
  });

  photoUploadLoading = signal(false);
  photoPreviewUrls = signal<{ original: string; icon: string; webview: string } | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.alerts.open('Please select an image file', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.alerts.open('File size must be less than 5MB', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }

      this.photoUploadLoading.set(true);
      this.personStore.uploadPersonPhoto(file).subscribe({
        next: (response: PhotoUploadResponse) => {
          this.photoPreviewUrls.set({
            original: buildStaticUrl(response.original),
            icon: buildStaticUrl(response.icon),
            webview: buildStaticUrl(response.webview),
          });
          this.photoUploadLoading.set(false);
        },
        error: () => {
          this.photoUploadLoading.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      const formData = this.personForm.value;
      const photoUrls = this.photoPreviewUrls();

      const data: PersonCreate = {
        first_name: formData.first_name as string,
        second_name: (formData.second_name as string) || '',
        person_eesl_id: formData.person_eesl_id ? Number(formData.person_eesl_id) : null,
        person_dob: formData.person_dob || null,
      };

      if (photoUrls) {
        data.person_photo_url = photoUrls.original.replace(`${API_BASE_URL}/`, '');
        data.person_photo_icon_url = photoUrls.icon.replace(`${API_BASE_URL}/`, '');
        data.person_photo_web_url = photoUrls.webview.replace(`${API_BASE_URL}/`, '');
      }

      withCreateAlert(
        this.alerts,
        () => this.personStore.createPerson(data),
        () => this.cancel(),
        'Person'
      );
    }
  }

  cancel(): void {
    this.navigationHelper.toPersonsList();
  }
}
