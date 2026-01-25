import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CollapsibleSectionService {
  private readonly globalExpandedSignal = signal<boolean | null>(null);
  private readonly versionSignal = signal(0);

  readonly globalExpanded = this.globalExpandedSignal.asReadonly();
  readonly version = this.versionSignal.asReadonly();

  setGlobalExpanded(expanded: boolean): void {
    this.globalExpandedSignal.set(expanded);
    this.versionSignal.update((v) => v + 1);
  }

  clearGlobalExpanded(): void {
    this.globalExpandedSignal.set(null);
  }
}
