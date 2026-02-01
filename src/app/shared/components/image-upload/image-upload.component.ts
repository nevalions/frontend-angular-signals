import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { TuiAlertService, TuiButton, TuiIcon, TuiLoader } from '@taiga-ui/core';

export interface ImageUrls {
  original: string;
  icon?: string;
  webview?: string;
}

export type ImageUploadMode = 'single' | 'three-size';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, TuiIcon, TuiLoader],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.less',
})
export class ImageUploadComponent {
  private alerts = inject(TuiAlertService);

  label = input.required<string>();
  mode = input<ImageUploadMode>('single');
  maxFileSizeMB = input(5);
  currentUrls = input<ImageUrls | null>(null);

  upload = output<File>();
  remove = output<void>();

  uploading = input(false);

  displayUrls = signal<ImageUrls | null>(null);

  maxSizeBytes = computed(() => this.maxFileSizeMB() * 1024 * 1024);
  maxFileSizeText = computed(() => `${this.maxFileSizeMB()}MB`);

  constructor() {
    effect(() => {
      this.displayUrls.set(this.currentUrls());
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.alerts.open('Please select an image file', { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }

      const maxSize = this.maxSizeBytes();
      if (file.size > maxSize) {
        this.alerts.open(`File size must be less than ${this.maxFileSizeText()}`, { label: 'Error', appearance: 'negative' }).subscribe();
        return;
      }

      this.upload.emit(file);
    }
  }

  removeImage(): void {
    this.remove.emit();
    this.displayUrls.set(null);
  }

  hasOriginal(): boolean {
    return !!this.displayUrls()?.original;
  }

  hasThreeSize(): boolean {
    const urls = this.displayUrls();
    return !!(urls?.original && urls?.icon && urls?.webview);
  }
}
