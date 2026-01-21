import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  effect,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

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

  readonly expanded = signal(true);
  readonly toggleIcon = computed(() => (this.expanded() ? '@tui.eye' : '@tui.eye-off'));
  readonly toggleLabel = computed(() =>
    this.expanded() ? 'Hide section content' : 'Show section content',
  );

  constructor() {
    effect(() => {
      const key = this.sectionKey();
      const storedValue = this.readStoredValue(key);
      const nextValue = storedValue ?? this.initiallyExpanded();

      this.expanded.set(nextValue);
    });

    effect(() => {
      const key = this.sectionKey();
      const value = this.expanded();

      this.persistValue(key, value);
    });
  }

  toggle(): void {
    this.expanded.update((value) => !value);
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
