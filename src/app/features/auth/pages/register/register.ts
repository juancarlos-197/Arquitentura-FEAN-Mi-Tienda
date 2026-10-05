import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../../core/services/auth';
import { Notification } from '../../../../core/services/notification';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-4">
            <mat-icon class="text-3xl">person_add</mat-icon>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Crear Nueva Cuenta</h2>
          <p class="text-sm text-slate-500 mt-1">
            Únete a Mi Tienda y experimenta la arquitectura FEAN
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-1">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Nombre Completo</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="Ej. Laura Gómez"
                autocomplete="name"
              />
              <mat-icon matPrefix class="text-slate-400 mr-2">person</mat-icon>
              @if (form.controls.name.invalid && form.controls.name.touched) {
                <mat-error>El nombre es requerido (mínimo 3 letras)</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="space-y-1">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Correo Electrónico</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="ejemplo@mitienda.com"
                autocomplete="email"
              />
              <mat-icon matPrefix class="text-slate-400 mr-2">email</mat-icon>
              @if (form.controls.email.invalid && form.controls.email.touched) {
                <mat-error>Introduce un correo electrónico válido</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="space-y-1">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              <mat-icon matPrefix class="text-slate-400 mr-2">lock</mat-icon>
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="showPassword.set(!showPassword())"
              >
                <mat-icon class="text-slate-400">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <mat-error>Mínimo 6 caracteres requeridos</mat-error>
              }
            </mat-form-field>
          </div>

          <button
            type="submit"
            mat-flat-button
            color="primary"
            [disabled]="form.invalid || isSubmitting()"
            class="w-full py-3 rounded-xl font-semibold shadow-md shadow-indigo-600/20 text-base"
          >
            @if (isSubmitting()) {
              <span class="flex items-center justify-center gap-2">
                <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                Registrando en Firebase Auth...
              </span>
            } @else {
              <span class="flex items-center justify-center gap-1.5">
                <mat-icon class="text-sm">how_to_reg</mat-icon>
                Registrarse Ahora
              </span>
            }
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">
            ¿Ya tienes una cuenta?
            <a routerLink="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly notification = inject(Notification);

  readonly showPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, password } = this.form.getRawValue();

    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/products']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
