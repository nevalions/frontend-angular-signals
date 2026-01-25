import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';

@Component({
  selector: 'app-input-number-with-buttons',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TuiButton, TuiIcon, TuiTextfield, TuiInputNumber],
  templateUrl: './input-number-with-buttons.component.html',
  styleUrl: './input-number-with-buttons.component.less',
})
export class InputNumberWithButtonsComponent {
  /** Current value */
  value = model<number>(0);

  /** Minimum allowed value */
  min = input(0);

  /** Maximum allowed value */
  max = input(999);

  /** Step value for increment/decrement */
  step = input(1);

  /** Label text displayed above the input */
  label = input('');

  /** Disabled state */
  disabled = input(false);

  /** Button size */
  size = input<'s' | 'm' | 'l'>('s');

  /** Emits the new value when changed */
  valueChange = output<number>();

  /** Computed to check if decrement is allowed */
  canDecrement = computed(() => !this.disabled() && this.value() > this.min());

  /** Computed to check if increment is allowed */
  canIncrement = computed(() => !this.disabled() && this.value() < this.max());

  /** Increment the value by step, respecting max constraint */
  increment(): void {
    if (this.canIncrement()) {
      const newValue = Math.min(this.value() + this.step(), this.max());
      this.value.set(newValue);
      this.valueChange.emit(newValue);
    }
  }

  /** Decrement the value by step, respecting min constraint */
  decrement(): void {
    if (this.canDecrement()) {
      const newValue = Math.max(this.value() - this.step(), this.min());
      this.value.set(newValue);
      this.valueChange.emit(newValue);
    }
  }

  /** Handle direct input value change */
  onValueChange(newValue: number | null): void {
    if (this.disabled() || newValue === null) {
      return;
    }

    // Clamp value to min/max constraints
    const clampedValue = Math.max(this.min(), Math.min(this.max(), newValue));
    this.value.set(clampedValue);
    this.valueChange.emit(clampedValue);
  }
}
