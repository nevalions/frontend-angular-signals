import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return router.createUrlTree(['/home']);
  }

  if (currentUser?.roles?.includes('admin')) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
