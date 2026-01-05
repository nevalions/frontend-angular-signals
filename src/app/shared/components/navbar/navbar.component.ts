import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiLink } from '@taiga-ui/core';
import { SeasonStoreService } from '../../../features/seasons/services/season-store.service';
import { SportStoreService } from '../../../features/sports/services/sport-store.service';
import { LoginIconComponent } from '../../../features/auth/components/login-icon/login-icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TuiLink, LoginIconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less',
})
export class NavbarComponent {
  private readonly seasonStore = inject(SeasonStoreService);
  private readonly sportStore = inject(SportStoreService);

  readonly title = 'statsboard';
  readonly sports = this.sportStore.sports;
  readonly seasons = this.seasonStore.seasons;

  readonly openDropdowns = signal<Set<number>>(new Set<number>());

  toggleDropdown(sportId: number): void {
    const current = new Set(this.openDropdowns());
    if (current.has(sportId)) {
      current.delete(sportId);
    } else {
      current.add(sportId);
    }
    this.openDropdowns.set(current);
  }

  isDropdownOpen(sportId: number): boolean {
    return this.openDropdowns().has(sportId);
  }

  closeAllDropdowns(): void {
    this.openDropdowns.set(new Set());
  }
}
