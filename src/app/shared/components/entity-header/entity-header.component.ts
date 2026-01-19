import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TuiActiveZone } from '@taiga-ui/cdk/directives/active-zone';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

export interface CustomMenuItem {
  id: string;
  label: string;
  icon?: string;
  type?: 'default' | 'danger';
}

@Component({
  selector: 'app-entity-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, TuiButton, TuiIcon, TuiActiveZone],
  templateUrl: './entity-header.component.html',
  styleUrl: './entity-header.component.less',
})
export class EntityHeaderComponent {
  title = input.required<string>();
  logoUrl = input<string | null>();
  showEdit = input(true);
  showDelete = input(true);
  showGear = input(true);
  customMenuItems = input<CustomMenuItem[]>([]);

  navigateBack = output<void>();
  edit = output<void>();
  delete = output<void>();
  customItemClick = output<string>();

  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onMenuActiveZoneChange(active: boolean): void {
    if (!active) {
      this.menuOpen.set(false);
    }
  }

  onEdit(): void {
    this.edit.emit();
    this.closeMenu();
  }

  onDelete(): void {
    this.delete.emit();
    this.closeMenu();
  }

  onCustomItemClick(itemId: string): void {
    this.customItemClick.emit(itemId);
    this.closeMenu();
  }
}
