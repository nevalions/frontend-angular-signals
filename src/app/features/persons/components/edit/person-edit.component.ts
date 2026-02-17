import { ChangeDetectionStrategy, Component, computed, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { PersonStoreService } from '../../services/person-store.service';
import { PersonUpdate, PhotoUploadResponse } from '../../models/person.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { buildStaticUrl, API_BASE_URL } from '../../../../core/config/api.constants';
import { ImageUploadComponent, type ImageUrls } from '../../../../shared/components/image-upload/image-upload.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-person-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, ImageUploadComponent],
  templateUrl: './person-edit.component.html',
  styleUrl: './person-edit.component.less',
})
export class PersonEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navigationHelper = inject(NavigationHelperService);
  private personStore = inject(PersonStoreService);
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private authService = inject(AuthService);

  personForm = this.fb.group({
    first_name: ['', [Validators.required]],
    second_name: [''],
    person_eesl_id: [null as number | null],
    person_dob: [''],
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

  currentUser = this.authService.currentUser;

  canEdit = computed(() => {
    const person = this.person();
    const currentUser = this.currentUser();
    return currentUser?.roles?.includes('admin')
      || currentUser?.roles?.includes('editor')
      || person?.owner_user_id === currentUser?.id;
  });

  private checkAccess = effect(() => {
    if (!this.canEdit()) {
      this.router.navigate(['/home']);
    }
  });

  loading = computed(() => this.personStore.loading());

  photoUploadLoading = signal(false);
  photoPreviewUrls = signal<ImageUrls | null>(null);

  currentPhotoUrls = computed<ImageUrls | null>(() => {
    const person = this.person();
    if (!person || !person.person_photo_url) return null;
    const urls: ImageUrls = {
      original: buildStaticUrl(person.person_photo_url),
    };
    if (person.person_photo_icon_url) {
      urls.icon = buildStaticUrl(person.person_photo_icon_url);
    }
    if (person.person_photo_web_url) {
      urls.webview = buildStaticUrl(person.person_photo_web_url);
    }
    return urls;
  });

  displayPhotoUrls = computed(() => this.photoPreviewUrls() ?? this.currentPhotoUrls());

  private patchFormOnPersonChange = effect(() => {
    const person = this.person();
    if (person) {
      this.personForm.patchValue({
        first_name: person.first_name,
        second_name: person.second_name || '',
        person_eesl_id: person.person_eesl_id || null,
        person_dob: person.person_dob || '',
      });
    }
  });

  onPhotoUpload(file: File): void {
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

  onPhotoRemove(): void {
    this.photoPreviewUrls.set(null);
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      const id = this.personId();
      if (!id) return;

      const formData = this.personForm.value;
      const newPhotoUrls = this.photoPreviewUrls();

      const data: PersonUpdate = {
        first_name: formData.first_name as string,
        second_name: (formData.second_name as string) || undefined,
      };

      if (formData.person_eesl_id) {
        data.person_eesl_id = Number(formData.person_eesl_id);
      }

      if (formData.person_dob) {
        data.person_dob = formData.person_dob;
      }

      if (newPhotoUrls) {
        data.person_photo_url = newPhotoUrls.original.replace(`${API_BASE_URL}/`, '');
        if (newPhotoUrls.icon) {
          data.person_photo_icon_url = newPhotoUrls.icon.replace(`${API_BASE_URL}/`, '');
        }
        if (newPhotoUrls.webview) {
          data.person_photo_web_url = newPhotoUrls.webview.replace(`${API_BASE_URL}/`, '');
        }
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
