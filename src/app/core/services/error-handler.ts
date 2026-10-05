import { inject, Injectable } from '@angular/core';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandler {
  private readonly notification = inject(Notification);

  handle(error: unknown, fallbackMessage = 'No se pudo completar la operación'): string {
    let message = fallbackMessage;

    if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      if (typeof err['error'] === 'string') {
        message = err['error'];
      } else if (err['message'] && typeof err['message'] === 'string') {
        message = err['message'];
      }
    }

    // Friendly transform for technical errors
    if (message.includes('PERMISSION_DENIED')) {
      message = 'Permiso denegado por las reglas de seguridad de Firebase.';
    } else if (message.includes('NOT_FOUND')) {
      message = 'El elemento solicitado no existe en la base de datos.';
    }

    this.notification.error(message);
    return message;
  }
}
