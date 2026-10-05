import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Notification } from '../services/notification';
import { UserRole } from '../../shared/models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const notification = inject(Notification);

  const expectedRoles: UserRole[] = route.data['roles'] || ['ADMIN'];
  const user = auth.currentUser();

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (expectedRoles.includes(user.role)) {
    return true;
  }

  notification.error(`Acceso restringido: Esta sección requiere rol ${expectedRoles.join(' o ')}`);
  router.navigate(['/products']);
  return false;
};
