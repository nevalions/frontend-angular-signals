import { ChangeDetectionStrategy, Component, computed, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { PersonUpdate, PhotoUploadResponse } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';

@Component({
  selector: 'app-person-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  templateUrl: './person-edit.component.html',
  styleUrl: './person-edit.component.less',
})
export class PersonEditComponent {
  private route = inject(ActivatedRoute);
  private navigationHelper = inject(NavigationHelperService);
  private personStore = inject(PersonStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);

  personForm = this.fb.group({
    first_name: ['', [Validators.required]],
    second_name: [''],
  });

  personId = toSignal(
    this.route.paramMap.pipe(map((params) => {
      const val = params.get('id');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  person = computed(() => {
    const id = this.personId();
    if (!id) return null;
    return this.personStore.persons().find((p) => p.id === id) || null;
  });

  loading = computed(() => this.personStore.loading());

  photoUploadLoading = signal(false);
  photoPreviewUrl = signal<string | null>(null);

  currentPhotoUrl = computed(() => {
    const url = this.person()?.person_photo_url ?? null;
    return url ? buildStaticUrl(url) : null;
  });

  displayPhotoUrl = computed(() => this.photoPreviewUrl() ?? this.currentPhotoUrl());

  private patchFormOnPersonChange = effect(() => {
    const person = this.person();
    if (person) {
      this.personForm.patchValue({
        first_name: person.first_name,
        second_name: person.second_name || '',
      });
    }
  });

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
          this.photoPreviewUrl.set(buildStaticUrl(response.webview));
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
      const id = this.personId();
      if (!id) return;

      const formData = this.personForm.value;
      const newPhotoUrl = this.photoPreviewUrl();

      const data: PersonUpdate = {
        first_name: formData.first_name as string,
        second_name: (formData.second_name as string) || undefined,
      };

      if (newPhotoUrl) {
        data.person_photo_url = newPhotoUrl.replace(`${API_BASE_URL}/`, '');
      }

      withUpdateAlert(
        this.alerts,
        () => this.personStore.updatePerson(id, data),
        () => this.cancel(),
        'Person'
      );
    }
  }

  cancel(): void {
    this.navigationHelper.toPersonsList();
  }
}
