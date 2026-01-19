import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

const ADMIN_ONLY_TABS = ['users', 'roles', 'global-settings'];

export const settingsAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return router.createUrlTree(['/home']);
  }

  const tab = route.queryParamMap.get('tab');

  if (tab && ADMIN_ONLY_TABS.includes(tab)) {
    if (currentUser?.roles?.includes('admin')) {
      return true;
    }
    return router.createUrlTree(['/home']);
  }

  return true;
};
