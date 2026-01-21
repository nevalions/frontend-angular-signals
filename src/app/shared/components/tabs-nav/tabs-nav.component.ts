import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TuiSegmented } from '@taiga-ui/kit';

export interface TabsNavItem {
  label: string;
  value: string;
  icon?: string;
}

@Component({
  selector: 'app-tabs-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiIcon, TuiSegmented],
  templateUrl: './tabs-nav.component.html',
  styleUrl: './tabs-nav.component.less',
})
export class TabsNavComponent {
  tabs = input.required<TabsNavItem[]>();
  activeTab = input.required<string | null>();
  appearance = input<'pills' | 'underline' | 'segmented'>('pills');
  segmentedSize = input<'s' | 'm' | 'l'>('l');

  tabChange = output<string>();

  activeValue = computed(() => {
    const tabs = this.tabs();
    const current = this.activeTab();
    if (current) return current;
    return tabs[0]?.value ?? '';
  });

  activeIndex = computed(() => {
    const tabs = this.tabs();
    const index = tabs.findIndex((tab) => tab.value === this.activeValue());
    return index >= 0 ? index : 0;
  });

  selectTab(value: string): void {
    this.tabChange.emit(value);
  }
}
