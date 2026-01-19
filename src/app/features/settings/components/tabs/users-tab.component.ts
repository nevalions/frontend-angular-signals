import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { debounceTime, interval, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiPagination } from '@taiga-ui/kit';
import { SettingsStoreService } from '../../services/settings-store.service';
import { UserList, UserListResponse } from '../../models/settings.model';
import { NavigationHelperService } from '../../../../shared/services/navigation-helper.service';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TuiTextfield,
    TuiButton,
    TuiPagination,
    TuiIcon,
    UserCardComponent,
  ],
  templateUrl: './users-tab.component.html',
  styleUrl: './users-tab.component.less',
})
export class UsersTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private navigationHelper = inject(NavigationHelperService);
  private destroyRef = inject(DestroyRef);

  users = signal<UserList[]>([]);
  usersLoading = signal(false);
  usersError = signal<string | null>(null);
  userSearchQuery = signal('');
  usersCurrentPage = signal(1);
  usersItemsPerPage = signal(10);
  usersTotalCount = signal(0);
  usersTotalPages = signal(0);
  usersSortBy = signal<'username' | 'email' | 'online'>('username');
  usersSortAscending = signal(true);

  readonly itemsPerPageOptions = [10, 20, 50];

  private searchSubject$ = new Subject<string>();

  constructor() {
    this.setupSearchDebounce();

    effect(() => {
      this.loadUsers();
    });

    effect(() => {
      const currentPage = this.usersCurrentPage();
      if (currentPage >= 1) {
        this.loadUsers();
      }
    });

    effect(() => {
      const itemsPerPage = this.usersItemsPerPage();
      if (itemsPerPage > 0) {
        this.loadUsers();
      }
    });

    effect(() => {
      const searchQuery = this.userSearchQuery();
      if (searchQuery !== undefined) {
        this.loadUsers();
      }
    });

    effect(() => {
      const sortBy = this.usersSortBy();
      if (sortBy) {
        this.loadUsers();
      }
    });

    effect(() => {
      const ascending = this.usersSortAscending();
      if (ascending !== undefined) {
        this.loadUsers();
      }
    });

    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadUsers();
      });
  }

  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query: string) => {
        this.userSearchQuery.set(query);
        this.usersCurrentPage.set(1);
      });
  }

  get apiTotalPages(): number {
    return this.usersTotalPages();
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);

    const sortBy = this.usersSortBy();
    const order_by = sortBy === 'online' ? 'last_online' : sortBy;

    this.settingsStore.getUsersPaginated(
      this.usersCurrentPage(),
      this.usersItemsPerPage(),
      this.userSearchQuery() || undefined,
      order_by,
      this.usersSortAscending()
    ).subscribe({
      next: (response: UserListResponse) => {
        this.users.set(response.data);
        this.usersTotalCount.set(response.metadata.total_items);
        this.usersTotalPages.set(response.metadata.total_pages);
        this.usersLoading.set(false);
      },
      error: () => {
        this.usersError.set('Failed to load users');
        this.usersLoading.set(false);
      }
    });
  }

  onUserSearchChange(query: string): void {
    if (query.length >= 2 || query.length === 0) {
      this.searchSubject$.next(query);
    }
  }

  clearUserSearch(): void {
    this.userSearchQuery.set('');
    this.usersCurrentPage.set(1);
  }

  onUsersPageChange(pageIndex: number): void {
    this.usersCurrentPage.set(pageIndex + 1);
  }

  onUsersItemsPerPageChange(itemsPerPage: number): void {
    this.usersItemsPerPage.set(itemsPerPage);
    this.usersCurrentPage.set(1);
  }

  navigateToUserDetail(userId: number): void {
    this.navigationHelper.toUserProfile(userId);
  }

  navigateToAddUser(): void {
    this.navigationHelper.toPersonCreate();
  }

  onSortDirectionToggle(): void {
    this.usersSortAscending.update(v => !v);
  }

  onSortByClick(sortBy: 'username' | 'email' | 'online'): void {
    if (this.usersSortBy() === sortBy) {
      this.usersSortAscending.update(v => !v);
    } else {
      this.usersSortBy.set(sortBy);
      this.usersSortAscending.set(true);
    }
  }
}
