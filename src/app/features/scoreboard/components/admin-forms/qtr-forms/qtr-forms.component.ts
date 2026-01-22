import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { CollapsibleSectionComponent } from '../collapsible-section/collapsible-section.component';

export interface QuarterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-qtr-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TuiButton, CollapsibleSectionComponent],
  templateUrl: './qtr-forms.component.html',
  styleUrl: './qtr-forms.component.less',
})
export class QtrFormsComponent {
  /** Current quarter value */
  currentQtr = input<string | null>(null);

  /** Emits when quarter changes */
  qtrChange = output<string>();

  /** Available quarter options */
  protected readonly quarterOptions: QuarterOption[] = [
    { value: '1st', label: '1st' },
    { value: '2nd', label: '2nd' },
    { value: '3rd', label: '3rd' },
    { value: '4th', label: '4th' },
    { value: 'OT', label: 'OT' },
  ];

  /** Selected quarter (defaults to 1st if not set) */
  protected readonly selectedQtr = computed(() => this.currentQtr() ?? '1st');

  /**
   * Handle quarter selection
   */
  onQuarterSelect(quarter: string): void {
    this.qtrChange.emit(quarter);
  }

  /**
   * Check if a quarter option is currently selected
   */
  isSelected(quarter: string): boolean {
    return this.selectedQtr() === quarter;
  }
}
