import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { CollapsibleSectionService } from './collapsible-section.service';

@Component({
  selector: 'app-collapsible-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, TuiButton, TuiIcon],
  templateUrl: './collapsible-section.component.html',
  styleUrl: './collapsible-section.component.less',
})
export class CollapsibleSectionComponent {
  title = input.required<string>();
  sectionKey = input.required<string>();
  initiallyExpanded = input(true);

  contentTemplate = contentChild<TemplateRef<unknown>>(TemplateRef);

  private readonly collapsibleSectionService = inject(CollapsibleSectionService);

  private readonly localExpanded = signal(true);
  readonly expanded = computed(() => {
    const globalExpanded = this.collapsibleSectionService.globalExpanded();
    if (globalExpanded !== null) {
      return globalExpanded;
    }
    return this.localExpanded();
  });
  readonly toggleIcon = computed(() => (this.expanded() ? '@tui.eye' : '@tui.eye-off'));
  readonly toggleLabel = computed(() =>
    this.expanded() ? 'Hide section content' : 'Show section content',
  );

  constructor() {
    effect(() => {
      const key = this.sectionKey();
      this.collapsibleSectionService.version();
      const storedValue = this.readStoredValue(key);
      const nextValue = storedValue ?? this.initiallyExpanded();

      this.localExpanded.set(nextValue);
    });

    effect(() => {
      const key = this.sectionKey();
      const value = this.localExpanded();

      this.persistValue(key, value);
    });
  }

  toggle(): void {
    this.collapsibleSectionService.clearGlobalExpanded();
    this.localExpanded.update((value) => !value);
  }

  private readStoredValue(key: string): boolean | null {
    if (!this.storageAvailable()) {
      return null;
    }

    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
      return null;
    }

    return storedValue === 'true';
  }

  private persistValue(key: string, value: boolean): void {
    if (!this.storageAvailable()) {
      return;
    }

    localStorage.setItem(key, String(value));
  }

  private storageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
