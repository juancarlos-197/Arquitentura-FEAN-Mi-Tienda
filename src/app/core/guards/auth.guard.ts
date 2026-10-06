import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Auth } from '../services/auth';
import { Notification } from '../services/notification';
import { UserRole } from '../../shared/models';

/**
 * Guardia funcional authGuard:
 * Verifica autenticación activa en el servicio de Auth y opcionalmente
 * restringe por roles declarados en route.data['roles'].
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);
  const notification = inject(Notification);

  // 1. Verificación de sesión activa
  if (!auth.isAuthenticated()) {
    notification.warning('Debes iniciar sesión para acceder a esta sección');
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // 2. Verificación de roles requeridos si están especificados en la ruta
  const expectedRoles = route.data['roles'] as UserRole[] | undefined;
  if (expectedRoles && expectedRoles.length > 0) {
    const user = auth.currentUser();
    const currentRole = user?.role;

    if (!currentRole || !expectedRoles.includes(currentRole)) {
      notification.error(
        `Acceso restringido: Se requiere rol de (${expectedRoles.join(' / ')}) para esta función`
      );
      return router.createUrlTree(['/products']);
    }
  }

  return true;
};

/**
 * Guardia exclusivo para módulos de administración (ADMIN)
 */
export const adminGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);
  const notification = inject(Notification);

  if (!auth.isAuthenticated()) {
    notification.warning('Inicia sesión con credenciales de Administrador');
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (!auth.isAdmin()) {
    notification.error('Acceso denegado: Esta sección es exclusiva de Administradores');
    return router.createUrlTree(['/products']);
  }

  return true;
};

/**
 * Guardia para gestión de pedidos y catálogo (ADMIN y MANAGER)
 */
export const orderManagementGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);
  const notification = inject(Notification);

  if (!auth.isAuthenticated()) {
    notification.warning('Inicia sesión para gestionar pedidos');
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (!auth.isAdmin() && !auth.isManager()) {
    notification.error('Acceso denegado: Se requiere rol de Administrador o Gestor (Manager)');
    return router.createUrlTree(['/products']);
  }

  return true;
};

/**
 * Clase AuthGuard para compatibilidad con inyección de clases tradicionales
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly notification = inject(Notification);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      this.notification.warning('Inicia sesión para continuar');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    const expectedRoles = route.data['roles'] as UserRole[] | undefined;
    if (expectedRoles && expectedRoles.length > 0) {
      const user = this.auth.currentUser();
      if (!user || !expectedRoles.includes(user.role)) {
        this.notification.error('No dispones de los permisos necesarios');
        return this.router.createUrlTree(['/products']);
      }
    }

    return true;
  }
}
