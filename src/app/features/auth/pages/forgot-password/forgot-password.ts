import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
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
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mb-4 border border-amber-200">
            <mat-icon class="text-3xl">lock_reset</mat-icon>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Recuperar Contraseña</h2>
          <p class="text-sm text-slate-500 mt-1">
            Enviaremos un enlace seguro para restablecer el acceso a tu cuenta
          </p>
        </div>

        @if (emailSent()) {
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm mb-6 text-center">
            <mat-icon class="text-3xl text-emerald-600 mb-2">mark_email_read</mat-icon>
            <p class="font-medium">¡Enlace de recuperación enviado!</p>
            <p class="text-xs text-emerald-700 mt-1">Revisa tu bandeja de entrada o spam para continuar.</p>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="space-y-1">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Correo Electrónico Registrado</mat-label>
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
                  Enviando enlace...
                </span>
              } @else {
                <span class="flex items-center justify-center gap-1.5">
                  <mat-icon class="text-sm">send</mat-icon>
                  Enviar Instrucciones
                </span>
              }
            </button>
          </form>
        }

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <a routerLink="/auth/login" class="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline text-sm">
            <mat-icon class="text-sm">arrow_back</mat-icon>
            Volver a Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPassword {
  private readonly auth = inject(Auth);

  readonly isSubmitting = signal<boolean>(false);
  readonly emailSent = signal<boolean>(false);

  readonly form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email } = this.form.getRawValue();

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.emailSent.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
