import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ApiResponse, AuthResponse, User, UserRole } from '../../shared/models';
import { Notification } from './notification';
import { Firebase } from './firebase';

const STORAGE_KEY_TOKEN = 'fean_auth_token';
const STORAGE_KEY_USER = 'fean_auth_user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notification = inject(Notification);
  private readonly firebaseService = inject(Firebase);

  private readonly _currentUser = signal<User | null>(this.getInitialUser());
  private readonly _token = signal<string | null>(this.getInitialToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._token());
  readonly userRole = computed<UserRole | null>(() => this._currentUser()?.role || null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isManager = computed(() => this._currentUser()?.role === 'MANAGER' || this._currentUser()?.role === 'ADMIN');
  readonly isCustomer = computed(() => this._currentUser()?.role === 'CUSTOMER');

  private getInitialUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        return JSON.parse(stored);
      }
      // Default to demo admin for instant rich interaction
      const defaultUser: User = {
        id: 'user-admin',
        name: 'Carlos Mendoza (Admin)',
        email: 'admin@mitienda.com',
        role: 'ADMIN',
        active: true,
        phone: '+34 611 223 344',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, 'fean_token_user-admin');
      return defaultUser;
    } catch {
      return null;
    }
  }

  private getInitialToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || 'fean_token_user-admin';
    } catch {
      return null;
    }
  }

  login(credentials: { email: string; password?: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(API_CONFIG.endpoints.auth.login, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data.token, res.data.user);
          this.notification.success(`¡Bienvenido de nuevo, ${res.data.user.name}!`);
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.error || 'Error al iniciar sesión';
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    );
  }

  register(data: { name: string; email: string; password?: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(API_CONFIG.endpoints.auth.register, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data.token, res.data.user);
          this.notification.success('Cuenta registrada con éxito');
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.error || 'Error al registrar usuario';
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(API_CONFIG.endpoints.auth.forgotPassword, { email }).pipe(
      tap(res => {
        this.notification.info(res.message || 'Instrucciones enviadas');
      }),
      catchError(err => {
        this.notification.error('Error al solicitar recuperación');
        return throwError(() => err);
      })
    );
  }

  async loginWithGoogle(): Promise<boolean> {
    const fireUser = await this.firebaseService.signInWithGoogle();
    if (!fireUser) return false;

    const token = await fireUser.getIdToken();
    const user: User = {
      id: fireUser.uid,
      name: fireUser.displayName || 'Usuario Google',
      email: fireUser.email || 'usuario@firebase.com',
      role: fireUser.email === 'jalban.dacompsc@gmail.com' ? 'ADMIN' : 'CUSTOMER',
      active: true,
      avatarUrl: fireUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.setSession(token, user);
    this.router.navigate(['/products']);
    return true;
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    this.notification.info('Sesión cerrada correctamente');
    this.router.navigate(['/auth/login']);
  }

  // Quick switch role / user helper for easy testing of multi-role permissions
  switchUser(user: User): void {
    const token = `fean_token_${user.id}`;
    this.setSession(token, user);
    this.notification.success(`Cambiado a perfil: ${user.name} (${user.role})`);
  }

  private setSession(token: string, user: User): void {
    this._token.set(token);
    this._currentUser.set(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }
}
