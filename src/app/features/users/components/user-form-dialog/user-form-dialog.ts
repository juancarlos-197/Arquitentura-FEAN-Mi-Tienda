import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User, UserRole } from '../../../../shared/models';
import { Users } from '../../services/users';

export interface UserDialogData {
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="p-6 max-w-lg w-full">
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <mat-icon>{{ data.user ? 'manage_accounts' : 'person_add' }}</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ data.user ? 'Modificar Usuario & Rol' : 'Crear Nuevo Usuario' }}
            </h2>
            <p class="text-xs text-slate-500">Gestión RBAC y control de acceso en Firebase</p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon class="text-slate-400">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre Completo *</mat-label>
            <input matInput formControlName="name" placeholder="Ej. Carlos Mendoza" />
            <mat-icon matPrefix class="text-slate-400 mr-2">badge</mat-icon>
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <mat-error>Nombre obligatorio</mat-error>
            }
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Correo Electrónico (Firebase Auth) *</mat-label>
            <input matInput type="email" formControlName="email" placeholder="usuario@mitienda.com" />
            <mat-icon matPrefix class="text-slate-400 mr-2">email</mat-icon>
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <mat-error>Correo electrónico válido requerido</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Rol en el Sistema *</mat-label>
              <mat-select formControlName="role">
                <mat-option value="ADMIN">
                  <span class="font-semibold text-indigo-700">👑 Administrador</span>
                </mat-option>
                <mat-option value="MANAGER">
                  <span class="font-semibold text-blue-700">💼 Manager / Gestor</span>
                </mat-option>
                <mat-option value="CUSTOMER">
                  <span class="font-semibold text-slate-700">🛍️ Cliente</span>
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="phone" placeholder="+34 600 000 000" />
              <mat-icon matPrefix class="text-slate-400 mr-2">call</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <div class="pt-2">
          <mat-slide-toggle formControlName="active" color="primary">
            <span class="text-sm font-medium text-slate-700">Usuario Activo (Permite inicio de sesión)</span>
          </mat-slide-toggle>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" mat-button (click)="dialogRef.close()">
            Cancelar
          </button>
          <button
            type="submit"
            mat-flat-button
            color="primary"
            [disabled]="form.invalid || isSubmitting()"
            class="rounded-xl px-5"
          >
            @if (isSubmitting()) {
              <span class="flex items-center gap-1.5">
                <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                Guardando en Firebase...
              </span>
            } @else {
              <span class="flex items-center gap-1.5">
                <mat-icon class="text-sm">save</mat-icon>
                {{ data.user ? 'Guardar Cambios' : 'Registrar Usuario' }}
              </span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class UserFormDialog {
  readonly dialogRef = inject(MatDialogRef<UserFormDialog>);
  readonly data: UserDialogData = inject(MAT_DIALOG_DATA);
  private readonly usersService = inject(Users);

  readonly isSubmitting = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl<string>(this.data.user?.name || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl<string>(this.data.user?.email || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<UserRole>(this.data.user?.role || 'CUSTOMER', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl<string>(this.data.user?.phone || '', {
      nonNullable: true,
    }),
    active: new FormControl<boolean>(this.data.user ? this.data.user.active : true, {
      nonNullable: true,
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.form.getRawValue();

    if (this.data.user) {
      this.usersService.updateUser(this.data.user.id, val).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
    } else {
      this.usersService.createUser(val).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
    }
  }
}
