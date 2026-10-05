import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, durationMs = 3500) {
    this.snackBar.open(message, 'Cerrar', {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['bg-emerald-700', 'text-white'],
    });
  }

  error(message: string, durationMs = 4500) {
    this.snackBar.open(message, 'Entendido', {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['bg-rose-700', 'text-white'],
    });
  }

  info(message: string, durationMs = 3000) {
    this.snackBar.open(message, 'OK', {
      duration: durationMs,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
