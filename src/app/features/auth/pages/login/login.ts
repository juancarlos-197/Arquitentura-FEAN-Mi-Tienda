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
        <div class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-4">
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

        <!-- Google Sign-In with Firebase Auth Button -->
        <button
          type="button"
          (click)="loginWithGoogle()"
          class="w-full py-3 px-4 mb-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google (Firebase Auth)</span>
        </button>

        <div class="relative flex py-1 items-center mb-4">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">o con correo</span>
          <div class="flex-grow border-t border-slate-200"></div>
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

  async loginWithGoogle(): Promise<void> {
    this.isSubmitting.set(true);
    try {
      await this.auth.loginWithGoogle();
    } finally {
      this.isSubmitting.set(false);
    }
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
