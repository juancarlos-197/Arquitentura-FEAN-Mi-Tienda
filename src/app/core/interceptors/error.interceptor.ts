import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client side or network error
        errorMessage = `Error de red: ${error.error.message}`;
      } else if (error.status === 401) {
        errorMessage = error.error?.error || 'Sesión expirada o no autorizada';
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        errorMessage = error.error?.error || 'No tienes permisos para realizar esta acción';
      } else if (error.status === 404) {
        errorMessage = error.error?.error || 'Recurso no encontrado';
      } else if (error.status >= 500) {
        errorMessage = error.error?.error || 'Error interno del servidor Express/Firebase';
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }

      // We only show toast if not already handled by a specific feature catch
      console.warn(`[HTTP Error ${error.status}]:`, errorMessage);
      return throwError(() => error);
    })
  );
};
