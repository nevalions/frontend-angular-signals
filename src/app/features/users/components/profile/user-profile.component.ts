import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TuiAlertService, TuiDialogService, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiValidator } from '@taiga-ui/cdk';
import { EntityHeaderComponent, CustomMenuItem } from '../../../../shared/components/entity-header/entity-header.component';
import { buildApiUrl } from '../../../../core/config/api.constants';
import { User } from '../../models/user.model';
import { UserStoreService } from '../../services/user-store.service';
import { withDeleteConfirm, withUpdateAlert } from '../../../../core/utils/alert-helper.util';
import { AuthService } from '../../../auth/services/auth.service';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword !== confirmPassword ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EntityHeaderComponent,
    ReactiveFormsModule,
    TuiValidator,
    TuiIcon,
    TuiTextfield,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.less',
})
export class UserProfileComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userStore = inject(UserStoreService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly emailValidator = Validators.email;

  userId = signal<number | null>(null);
  userResource = httpResource<User>(() => {
    const userId = this.userId();
    const current = this.currentUser();

    if (!userId) return undefined;

    if (current?.id === userId) {
      return buildApiUrl('/api/users/me');
    }

    if (current?.roles?.includes('admin')) {
      return buildApiUrl(`/api/users/${userId}`);
    }

    return undefined;
  });

  user = computed(() => this.userResource.value());
  loading = computed(() => this.userResource.isLoading());
  error = computed(() => this.userResource.error());

  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  fromSettings = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('fromSettings');
      return val === 'true';
    })),
    { initialValue: false }
  );

  isOwner = computed(() => {
    const current = this.currentUser();
    const profileId = this.userId();
    return current?.id === profileId;
  });

  canView = computed(() => {
    const userId = this.userId();
    const current = this.currentUser();
    if (userId === null || !current) {
      return false;
    }

    return userId === current.id || current.roles?.includes('admin') === true;
  });

  private checkAccess = effect(() => {
    if (!this.canView()) {
      this.router.navigate(['/home']);
    }
  });

  isAdmin = computed(() => {
    const current = this.currentUser();
    return current?.roles?.includes('admin') ?? false;
  });

  canEdit = computed(() => this.isOwner() || this.isAdmin());
  canDelete = computed(() => this.isOwner() || this.isAdmin());

  editingEmail = signal(false);

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator() });

  passwordError = signal<string | null>(null);
  changingPassword = signal(false);

  customMenuItems = computed<CustomMenuItem[]>(() => {
    return this.canDelete()
      ? [{ id: 'delete-user', label: 'Delete account', type: 'danger', icon: '@tui.trash' }]
      : [];
  });

  private syncUserData = effect(() => {
    const user = this.user();
    if (user) {
      console.log('User data loaded:', user);
      this.emailForm.patchValue({ email: user.email });
      console.log('User roles:', user.roles);
    }
  });

  constructor() {
    const userIdParam = this.route.snapshot.paramMap.get('userId');
    if (userIdParam) {
      this.userId.set(Number(userIdParam));
    }
  }

  userDisplayName = computed(() => {
    const user = this.user();
    return user?.username || 'Unknown User';
  });

  userStatus = computed(() => {
    const user = this.user();
    return user?.is_active ? 'Active' : 'Inactive';
  });

  userRoles = computed(() => {
    const user = this.user();
    return user?.roles || [];
  });

  userCreated = computed(() => {
    const user = this.user();
    if (!user?.created) return 'N/A';
    const date = new Date(user.created);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  userLastOnline = computed(() => {
    const user = this.user();
    if (!user?.last_online) return 'Never';
    const date = new Date(user.last_online);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  userIsOnline = computed(() => {
    const user = this.user();
    return user?.is_online ?? false;
  });

  navigateBack(): void {
    if (this.fromSettings()) {
      this.router.navigate(['/settings'], { queryParams: { tab: 'users' } });
    } else {
      this.router.navigate(['/home']);
    }
  }

  onCustomItemClick(itemId: string): void {
    if (itemId === 'delete-user') {
      const user = this.user();
      const userId = this.userId();
      if (!user || !userId) return;

      withDeleteConfirm(
        this.dialogs,
        this.alerts,
        {
          label: `Delete user "${user.username}"?`,
          content: 'This action cannot be undone!',
        },
        () => this.userStore.deleteUser(userId),
        () => this.navigateBack(),
        'User'
      );
    }
  }

  startEditEmail(): void {
    const user = this.user();
    if (!user) return;
    this.editingEmail.set(true);
  }

  saveEmail(): void {
    const userId = this.userId();
    if (!userId) return;

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    withUpdateAlert(
      this.alerts,
      () => this.userStore.updateUserEmail(userId, { email: this.emailForm.value.email || '' }),
      () => {
        this.userResource.reload();
        this.editingEmail.set(false);
      },
      'Email'
    );
  }

  cancelEditEmail(): void {
    const user = this.user();
    if (!user) return;
    this.emailForm.patchValue({ email: user.email });
    this.editingEmail.set(false);
  }

  submitPasswordChange(): void {
    this.passwordError.set(null);

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.passwordError.set('All fields are required');
      return;
    }

    const userId = this.userId();
    if (!userId) return;

    withUpdateAlert(
      this.alerts,
      () => this.userStore.changePassword(userId, {
        old_password: currentPassword,
        new_password: newPassword,
      }),
      () => {
        this.passwordForm.reset();
        this.changingPassword.set(false);
      },
      'Password'
    );
  }

  cancelPasswordChange(): void {
    this.passwordForm.reset();
    this.passwordError.set(null);
    this.changingPassword.set(false);
  }
}
