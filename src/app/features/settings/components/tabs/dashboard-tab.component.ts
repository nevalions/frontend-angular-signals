import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { TuiAppearance, TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { TuiBadge } from '@taiga-ui/kit';
import { SettingsStoreService } from '../../services/settings-store.service';
import { UserList } from '../../models/settings.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiAppearance,
    TuiButton,
    TuiLoader,
    TuiTitle,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiBadge,
  ],
  templateUrl: './dashboard-tab.component.html',
  styleUrl: './dashboard-tab.component.less',
})
export class DashboardTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  usersOnline = signal<UserList[]>([]);
  usersOnlineLoading = signal(false);
  usersOnlineError = signal<string | null>(null);

  adminsOnline = signal<UserList[]>([]);
  adminsOnlineLoading = signal(false);
  adminsOnlineError = signal<string | null>(null);

  recentlyRegistered = signal<UserList[]>([]);
  recentlyRegisteredLoading = signal(false);
  recentlyRegisteredError = signal<string | null>(null);

  constructor() {
    this.loadAllData();

    effect(() => {
      this.loadUsersOnline();
    });

    effect(() => {
      this.loadAdminsOnline();
    });

    effect(() => {
      this.loadRecentlyRegistered();
    });

    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadAllData();
      });
  }

  private loadAllData(): void {
    this.loadUsersOnline();
    this.loadAdminsOnline();
    this.loadRecentlyRegistered();
  }

  private loadUsersOnline(): void {
    this.usersOnlineLoading.set(true);
    this.usersOnlineError.set(null);

    this.settingsStore.getUsersWithFilters(
      1,
      5,
      undefined,
      undefined,
      true
    ).subscribe({
      next: (response) => {
        this.usersOnline.set(response.data);
        this.usersOnlineLoading.set(false);
      },
      error: () => {
        this.usersOnlineError.set('Failed to load online users');
        this.usersOnlineLoading.set(false);
      }
    });
  }

  private loadAdminsOnline(): void {
    this.adminsOnlineLoading.set(true);
    this.adminsOnlineError.set(null);

    this.settingsStore.getUsersWithFilters(
      1,
      5,
      undefined,
      ['admin'],
      true
    ).subscribe({
      next: (response) => {
        this.adminsOnline.set(response.data);
        this.adminsOnlineLoading.set(false);
      },
      error: () => {
        this.adminsOnlineError.set('Failed to load online admins');
        this.adminsOnlineLoading.set(false);
      }
    });
  }

  private loadRecentlyRegistered(): void {
    this.recentlyRegisteredLoading.set(true);
    this.recentlyRegisteredError.set(null);

    this.settingsStore.getUsersPaginated(
      1,
      5,
      undefined,
      'created',
      false
    ).subscribe({
      next: (response) => {
        this.recentlyRegistered.set(response.data);
        this.recentlyRegisteredLoading.set(false);
      },
      error: () => {
        this.recentlyRegisteredError.set('Failed to load recently registered users');
        this.recentlyRegisteredLoading.set(false);
      }
    });
  }

  navigateToUsersTab(): void {
    this.router.navigate([], {
      queryParams: { tab: 'users' }
    });
  }

  formatLastOnline(lastOnline: string | null): string {
    if (!lastOnline) return 'Never';

    const now = new Date();
    const last = new Date(lastOnline);
    const diffMs = now.getTime() - last.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day ago`;
  }

  formatJoinedDate(created: string): string {
    const date = new Date(created);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
