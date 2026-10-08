import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApiResponse, AuthResponse, User, UserRole } from '../../shared/models';
import { Notification } from './notification';
import { Firebase } from './firebase';

const STORAGE_KEY_TOKEN = 'fean_auth_token';
const STORAGE_KEY_USER = 'fean_auth_user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
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
      const defaultUser: User = {
        id: 'user-admin',
        name: 'Carlos Mendoza (Admin)',
        email: 'admin@mitienda.com',
        role: 'ADMIN',
        active: true,
        phone: '+34 611 223 344',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
    const isAdmin = credentials.email.toLowerCase().includes('admin');
    const isManager = credentials.email.toLowerCase().includes('manager');
    const role: UserRole = isAdmin ? 'ADMIN' : (isManager ? 'MANAGER' : 'CUSTOMER');

    const user: User = {
      id: isAdmin ? 'user-admin' : `user-${Date.now()}`,
      name: isAdmin ? 'Carlos Mendoza (Admin)' : (isManager ? 'Elena Rodríguez (Manager)' : 'Cliente Autenticado'),
      email: credentials.email,
      role,
      active: true,
      avatarUrl: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = `token-${user.id}`;
    this.setSession(token, user);
    this.notification.success(`¡Bienvenido/a, ${user.name}!`);
    return of({ success: true, data: { user, token } });
  }

  register(data: { name: string; email: string; password?: string }): Observable<ApiResponse<AuthResponse>> {
    const user: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'CUSTOMER',
      active: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const token = `token-${user.id}`;
    this.setSession(token, user);
    this.notification.success('Cuenta registrada con éxito');
    return of({ success: true, data: { user, token } });
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    this.notification.info(`Instrucciones enviadas a ${email}`);
    return of({ success: true, message: 'Instrucciones enviadas' });
  }

  async loginWithGoogle(): Promise<boolean> {
    const fireUser = await this.firebaseService.signInWithGoogle();
    if (!fireUser) return false;

    const token = await fireUser.getIdToken();
    const user: User = {
      id: fireUser.uid,
      name: fireUser.displayName || 'Usuario Google',
      email: fireUser.email || '',
      role: 'CUSTOMER',
      active: true,
      avatarUrl: fireUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.setSession(token, user);
    return true;
  }

  setSession(token: string, user: User): void {
    this._token.set(token);
    this._currentUser.set(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch (err) {
        console.error('Error al guardar sesión:', err);
      }
    }
  }

  setUser(user: User): void {
    this._currentUser.set(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch (err) {
        console.error('Error al actualizar usuario:', err);
      }
    }
  }

  switchUser(user: User): void {
    this.setUser(user);
    const token = `fean_token_${user.id}`;
    this._token.set(token);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      } catch (err) {
        console.error('Error al cambiar token:', err);
      }
    }
    this.notification.info(`Perfil cambiado a: ${user.name}`);
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    this.firebaseService.logout();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
      }
    }
    this.notification.info('Sesión cerrada');
    this.router.navigate(['/products']);
  }
}
