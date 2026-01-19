import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { debounceTime, interval, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogService, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { SettingsStoreService } from '../../services/settings-store.service';
import { UserList, UserListResponse } from '../../models/settings.model';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';

@Component({
  selector: 'app-admins-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiButton,
    TuiCardLarge,
    TuiPagination,
    TuiIcon,
  ],
  templateUrl: './admins-tab.component.html',
  styleUrl: './admins-tab.component.less',
})
export class AdminsTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private destroyRef = inject(DestroyRef);

  admins = signal<UserList[]>([]);
  adminsLoading = signal(false);
  adminsError = signal<string | null>(null);
  adminSearchQuery = signal('');
  adminsCurrentPage = signal(1);
  adminsItemsPerPage = signal(10);
  adminsTotalCount = signal(0);
  adminsTotalPages = signal(0);

  readonly itemsPerPageOptions = [10, 20, 50];

  // Filter to only show users with ONLY admin role
  adminsList = computed(() => this.admins().filter(user => user.roles.length === 1 && user.roles[0] === 'admin'));
  adminsCount = computed(() => this.adminsList().length);

  private searchSubject$ = new Subject<string>();

  constructor() {
    this.setupSearchDebounce();

    signal(() => {
      this.loadAdmins();
    });

    signal(() => {
      const currentPage = this.adminsCurrentPage();
      if (currentPage >= 1) {
        this.loadAdmins();
      }
    });

    signal(() => {
      const itemsPerPage = this.adminsItemsPerPage();
      if (itemsPerPage > 0) {
        this.loadAdmins();
      }
    });

    signal(() => {
      const searchQuery = this.adminSearchQuery();
      if (searchQuery !== undefined) {
        this.loadAdmins();
      }
    });

    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadAdmins();
      });
  }

  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query: string) => {
        this.adminSearchQuery.set(query);
        this.adminsCurrentPage.set(1);
      });
  }

  get apiTotalPages(): number {
    return this.adminsTotalPages();
  }

  loadAdmins(): void {
    this.adminsLoading.set(true);
    this.adminsError.set(null);

    this.settingsStore.getAdminsPaginated(
      this.adminsCurrentPage(),
      this.adminsItemsPerPage(),
      this.adminSearchQuery() || undefined
    ).subscribe({
      next: (response: UserListResponse) => {
        this.admins.set(response.data);
        this.adminsTotalCount.set(response.metadata.total_items);
        this.adminsTotalPages.set(response.metadata.total_pages);
        this.adminsLoading.set(false);
      },
      error: () => {
        this.adminsError.set('Failed to load admins');
        this.adminsLoading.set(false);
      }
    });
  }

  onAdminSearchChange(query: string): void {
    if (query.length >= 2 || query.length === 0) {
      this.searchSubject$.next(query);
    }
  }

  clearAdminSearch(): void {
    this.adminSearchQuery.set('');
    this.adminsCurrentPage.set(1);
  }

  onAdminsPageChange(pageIndex: number): void {
    this.adminsCurrentPage.set(pageIndex + 1);
  }

  onAdminsItemsPerPageChange(itemsPerPage: number): void {
    this.adminsItemsPerPage.set(itemsPerPage);
    this.adminsCurrentPage.set(1);
  }

  editAdmin(admin: UserList): void {
    this.alerts.open('Edit admin functionality coming soon', { label: 'Info', appearance: 'info' });
  }

  removeAdmin(admin: UserList): void {
    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Remove admin privileges from "${admin.username}"?`,
        content: 'This user will lose admin access.',
      },
      () => this.settingsStore.removeUserAdmin(admin.id),
      () => this.loadAdmins(),
      'Admin privileges'
    );
  }
}
