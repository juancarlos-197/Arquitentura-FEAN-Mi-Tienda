import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, User } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';

@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadUsers(): Observable<ApiResponse<User[]>> {
    this._loading.set(true);
    return this.http.get<ApiResponse<User[]>>(API_CONFIG.endpoints.users).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._users.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('Error al cargar la lista de usuarios');
        return throwError(() => err);
      })
    );
  }

  createUser(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(API_CONFIG.endpoints.users, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._users.update(list => [res.data!, ...list]);
          this.notification.success('Usuario creado en Firebase Auth & Firestore');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo crear el usuario');
        return throwError(() => err);
      })
    );
  }

  updateUser(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${API_CONFIG.endpoints.users}/${id}`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._users.update(list => list.map(u => (u.id === id ? res.data! : u)));
          this.notification.success('Datos de usuario actualizados correctamente');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo actualizar el usuario');
        return throwError(() => err);
      })
    );
  }

  deleteUser(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_CONFIG.endpoints.users}/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this._users.update(list => list.filter(u => u.id !== id));
          this.notification.success('Usuario eliminado de Firebase');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo eliminar el usuario');
        return throwError(() => err);
      })
    );
  }
}
