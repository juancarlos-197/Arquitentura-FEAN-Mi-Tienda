import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 max-w-md">
      <div class="flex items-start gap-4">
        <div
          class="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          [class]="data.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'"
        >
          <mat-icon>{{ data.icon || (data.isDestructive ? 'warning' : 'help_outline') }}</mat-icon>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-slate-900 mb-1.5">{{ data.title }}</h2>
          <p class="text-sm text-slate-600 leading-relaxed">{{ data.message }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          mat-button
          class="rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
          (click)="dialogRef.close(false)"
        >
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button
          type="button"
          mat-flat-button
          [color]="data.isDestructive ? 'warn' : 'primary'"
          class="rounded-lg shadow-sm font-medium"
          (click)="dialogRef.close(true)"
        >
          <mat-icon class="mr-1 text-sm">{{ data.isDestructive ? 'delete' : 'check' }}</mat-icon>
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialog {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
