import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10">
        <!-- Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-4">
            <mat-icon class="text-3xl">storefront</mat-icon>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Iniciar Sesión</h2>
          <p class="text-sm text-slate-500 mt-1">
            Acceso a la plataforma Mi Tienda (Arquitectura FEAN)
          </p>
        </div>

        <!-- Quick Demo Switcher -->
        <div class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-6">
          <p class="text-xs font-semibold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <mat-icon class="text-sm">key</mat-icon>
            Accesos de Demostración Rápida
          </p>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              (click)="fillDemo('admin@mitienda.com')"
              class="px-2 py-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs transition-all text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              (click)="fillDemo('manager@mitienda.com')"
              class="px-2 py-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs transition-all text-center"
            >
              💼 Manager
            </button>
            <button
              type="button"
              (click)="fillDemo('jalban.dacompsc@gmail.com')"
              class="px-2 py-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 shadow-2xs transition-all text-center"
            >
              🛍️ Cliente
            </button>
          </div>
        </div>

        <!-- Login Reactive Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
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
            <div class="flex items-center justify-end mb-1">
              <a
                routerLink="/auth/forgot-password"
                class="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <mat-icon matPrefix class="text-slate-400 mr-2">lock</mat-icon>
              <button
                type="button"
                mat-icon-button
                matSuffix
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Ver contraseña'"
              >
                <mat-icon class="text-slate-400">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
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
                Validando en Firebase Auth...
              </span>
            } @else {
              <span class="flex items-center justify-center gap-1.5">
                <mat-icon class="text-sm">login</mat-icon>
                Entrar al Sistema
              </span>
            }
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">
            ¿No tienes cuenta?
            <a routerLink="/auth/register" class="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Crea tu cuenta aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly showPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  readonly form = new FormGroup({
    email: new FormControl<string>('admin@mitienda.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('123456', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  fillDemo(email: string): void {
    this.form.patchValue({
      email,
      password: 'demoPassword123',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login({ email, password }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.data?.user.role === 'ADMIN' || res.data?.user.role === 'MANAGER') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
