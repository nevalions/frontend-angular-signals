import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ScoreboardStoreService } from '../../features/scoreboard/services/scoreboard-store.service';
import { map, catchError, of } from 'rxjs';

export const scoreboardAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const scoreboardStore = inject(ScoreboardStoreService);

  const currentUser = authService.currentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return router.createUrlTree(['/home']);
  }

  const roles = currentUser?.roles ?? [];
  if (roles.includes('admin') || roles.includes('editor')) {
    return true;
  }

  const matchId = route.paramMap.get('matchId');
  if (!matchId) {
    return router.createUrlTree(['/home']);
  }

  return scoreboardStore.getComprehensiveMatchData(Number(matchId)).pipe(
    map((data) => {
      const matchUserId = data.match.user_id;
      if (matchUserId === currentUser?.id) {
        return true;
      }
      return router.createUrlTree(['/home']);
    }),
    catchError(() => of(router.createUrlTree(['/home'])))
  );
};
