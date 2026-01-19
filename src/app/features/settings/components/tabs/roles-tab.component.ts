import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type TuiDialogContext } from '@taiga-ui/core';
import { debounceTime, interval, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogService, TuiIcon, TuiTextfield, TuiDataList } from '@taiga-ui/core';
import { TuiPagination, TuiSelect } from '@taiga-ui/kit';
import { SettingsStoreService } from '../../services/settings-store.service';
import { UserList, RoleList, UserListResponse, RoleListResponse } from '../../models/settings.model';
import { withDeleteConfirm } from '../../../../core/utils/alert-helper.util';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-roles-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TuiTextfield,
    TuiButton,
    TuiPagination,
    TuiIcon,
    TuiSelect,
    TuiDataList,
    UserCardComponent,
  ],
  templateUrl: './roles-tab.component.html',
  styleUrl: './roles-tab.component.less',
})
export class RolesTabComponent {
  private settingsStore = inject(SettingsStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private destroyRef = inject(DestroyRef);

  roles = signal<RoleList[]>([]);
  rolesLoading = signal(false);
  rolesError = signal<string | null>(null);
  roleSearchQuery = signal('');
  rolesCurrentPage = signal(1);
  rolesItemsPerPage = signal(10);
  rolesTotalPages = signal(0);

  users = signal<UserList[]>([]);
  usersLoading = signal(false);
  usersError = signal<string | null>(null);
  userSearchQuery = signal('');
  usersCurrentPage = signal(1);
  usersItemsPerPage = signal(10);
  usersTotalPages = signal(0);
  selectedRoleFilter = signal<string | null>(null);
  selectedOnlineFilter = signal<'all' | 'online' | 'offline'>('all');
  selectedRoleToAdd = signal<number | null>(null);
  userToAddRole = signal<UserList | null>(null);
  selectRoleDialog = viewChild.required<TemplateRef<unknown>>('selectRoleDialog');

  readonly itemsPerPageOptions = [10, 20, 50];
  readonly onlineFilterOptions = [
    { label: 'All', value: 'all' as const },
    { label: 'Online', value: 'online' as const },
    { label: 'Offline', value: 'offline' as const },
  ];

  private roleSearchSubject$ = new Subject<string>();
  private userSearchSubject$ = new Subject<string>();

  constructor() {
    this.stringifyOnlineFilter = this.stringifyOnlineFilter.bind(this);
    this.setupSearchDebounce();

    effect(() => {
      this.loadRoles();
    });

    effect(() => {
      const currentPage = this.rolesCurrentPage();
      if (currentPage >= 1) {
        this.loadRoles();
      }
    });

    effect(() => {
      const itemsPerPage = this.rolesItemsPerPage();
      if (itemsPerPage > 0) {
        this.loadRoles();
      }
    });

    effect(() => {
      const searchQuery = this.roleSearchQuery();
      if (searchQuery !== undefined) {
        this.loadRoles();
      }
    });

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
      const roleFilter = this.selectedRoleFilter();
      if (roleFilter !== undefined) {
        this.loadUsers();
      }
    });

    effect(() => {
      const onlineFilter = this.selectedOnlineFilter();
      if (onlineFilter !== undefined) {
        this.loadUsers();
      }
    });

    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadRoles();
        this.loadUsers();
      });
  }

  private setupSearchDebounce(): void {
    this.roleSearchSubject$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query: string) => {
        this.roleSearchQuery.set(query);
        this.rolesCurrentPage.set(1);
      });

    this.userSearchSubject$
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query: string) => {
        this.userSearchQuery.set(query);
        this.usersCurrentPage.set(1);
      });
  }

  get rolesApiTotalPages(): number {
    return this.rolesTotalPages();
  }

  get usersApiTotalPages(): number {
    return this.usersTotalPages();
  }

  loadRoles(): void {
    this.rolesLoading.set(true);
    this.rolesError.set(null);

    this.settingsStore.getRolesPaginated(
      this.rolesCurrentPage(),
      this.rolesItemsPerPage(),
      this.roleSearchQuery() || undefined,
      'name'
    ).subscribe({
      next: (response: RoleListResponse) => {
        if (response?.data) {
          this.roles.set(response.data);
        } else {
          this.roles.set([]);
        }
        if (response?.metadata) {
          this.rolesTotalPages.set(response.metadata.total_pages);
        } else {
          this.rolesTotalPages.set(0);
        }
        this.rolesLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
        this.rolesError.set('Failed to load roles');
        this.rolesLoading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);

    let isOnlineFilter: boolean | undefined;
    if (this.selectedOnlineFilter() === 'online') {
      isOnlineFilter = true;
    } else if (this.selectedOnlineFilter() === 'offline') {
      isOnlineFilter = false;
    }

    const roleFilter = this.selectedRoleFilter();
    this.settingsStore.getUsersWithFilters(
      this.usersCurrentPage(),
      this.usersItemsPerPage(),
      this.userSearchQuery() || undefined,
      roleFilter ? [roleFilter] : undefined,
      isOnlineFilter
    ).subscribe({
      next: (response: UserListResponse) => {
        if (response?.data) {
          this.users.set(response.data);
        } else {
          this.users.set([]);
        }
        if (response?.metadata) {
          this.usersTotalPages.set(response.metadata.total_pages);
        } else {
          this.usersTotalPages.set(0);
        }
        this.usersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.usersError.set('Failed to load users');
        this.usersLoading.set(false);
      }
    });
  }

  onRoleSearchChange(query: string): void {
    if (query.length >= 2 || query.length === 0) {
      this.roleSearchSubject$.next(query);
    }
  }

  onUserSearchChange(query: string): void {
    if (query.length >= 2 || query.length === 0) {
      this.userSearchSubject$.next(query);
    }
  }

  clearRoleSearch(): void {
    this.roleSearchQuery.set('');
    this.rolesCurrentPage.set(1);
  }

  clearUserSearch(): void {
    this.userSearchQuery.set('');
    this.usersCurrentPage.set(1);
  }

  onRolesPageChange(pageIndex: number): void {
    this.rolesCurrentPage.set(pageIndex + 1);
  }

  onUsersPageChange(pageIndex: number): void {
    this.usersCurrentPage.set(pageIndex + 1);
  }

  onRolesItemsPerPageChange(itemsPerPage: number): void {
    this.rolesItemsPerPage.set(itemsPerPage);
    this.rolesCurrentPage.set(1);
  }

  onUsersItemsPerPageChange(itemsPerPage: number): void {
    this.usersItemsPerPage.set(itemsPerPage);
    this.usersCurrentPage.set(1);
  }

  addRole(): void {
    const roleName = window.prompt('Enter role name:');
    if (roleName) {
      const description = window.prompt('Enter description (optional):') || undefined;
      this.settingsStore.createRole(roleName, description).subscribe({
        next: () => {
          this.alerts.open('Role created successfully', {
            label: 'Success',
            appearance: 'positive',
            autoClose: 3000,
          }).subscribe();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Failed to create role:', err);
          this.alerts.open(`Failed to create role: ${err.message || 'Unknown error'}`, {
            label: 'Error',
            appearance: 'negative',
            autoClose: 0,
          }).subscribe();
        }
      });
    }
  }

  editRole(role: RoleList): void {
    const newName = window.prompt('Edit role name:', role.name);
    if (newName && newName !== role.name) {
      const newDescription = window.prompt('Edit description (optional):', role.description || '') || undefined;
      this.settingsStore.updateRole(role.id, newName, newDescription).subscribe({
        next: () => {
          this.alerts.open('Role updated successfully', {
            label: 'Success',
            appearance: 'positive',
            autoClose: 3000,
          }).subscribe();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Failed to update role:', err);
          this.alerts.open(`Failed to update role: ${err.message || 'Unknown error'}`, {
            label: 'Error',
            appearance: 'negative',
            autoClose: 0,
          }).subscribe();
        }
      });
    }
  }

  deleteRole(role: RoleList): void {
    withDeleteConfirm(
      this.dialogs,
      this.alerts,
      {
        label: `Delete role "${role.name}"?`,
        content: 'This action cannot be undone.',
      },
      () => this.settingsStore.deleteRole(role.id),
      () => this.loadRoles(),
      'Role'
    );
  }

  addUserRole(user: UserList): void {
    this.userToAddRole.set(user);
    this.selectedRoleToAdd.set(null);

    this.dialogs
      .open(this.selectRoleDialog(), {
        label: 'Add Role to User',
        size: 's',
        dismissible: true,
      })
      .subscribe((roleId: unknown) => {
        if (typeof roleId === 'number') {
          const role = this.roles().find(r => r.id === roleId);
          if (role) {
            this.settingsStore.addUserRole(user.id, roleId).subscribe({
              next: () => {
                this.alerts.open(`Role "${role.name}" added to user successfully`, {
                  label: 'Success',
                  appearance: 'positive',
                  autoClose: 3000,
                }).subscribe();
                this.loadUsers();
              },
              error: (err) => {
                console.error('Failed to add role:', err);
                this.alerts.open(`Failed to add role: ${err.message || 'Unknown error'}`, {
                  label: 'Error',
                  appearance: 'negative',
                  autoClose: 0,
                }).subscribe();
              }
            });
          }
        }
      });
  }

  onRoleFilterChange(roleName: string | null): void {
    this.selectedRoleFilter.set(roleName);
    this.usersCurrentPage.set(1);
  }

  onOnlineFilterChange(onlineStatus: 'all' | 'online' | 'offline'): void {
    this.selectedOnlineFilter.set(onlineStatus);
    this.usersCurrentPage.set(1);
  }

  stringifyOnlineFilter(status: 'all' | 'online' | 'offline'): string {
    if (!status) return '';
    const option = this.onlineFilterOptions.find(o => o.value === status);
    return option ? option.label : '';
  }
}
