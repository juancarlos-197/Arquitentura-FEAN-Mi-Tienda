import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, Category } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';

@Injectable({
  providedIn: 'root',
})
export class Categories {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  private readonly _categories = signal<Category[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadCategories(): Observable<ApiResponse<Category[]>> {
    this._loading.set(true);
    return this.http.get<ApiResponse<Category[]>>(API_CONFIG.endpoints.categories).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._categories.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('Error al cargar categorías');
        return throwError(() => err);
      })
    );
  }

  createCategory(data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(API_CONFIG.endpoints.categories, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._categories.update(list => [...list, res.data!]);
          this.notification.success('Categoría creada en Firebase');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo crear la categoría');
        return throwError(() => err);
      })
    );
  }

  updateCategory(id: string, data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${API_CONFIG.endpoints.categories}/${id}`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._categories.update(list => list.map(c => (c.id === id ? res.data! : c)));
          this.notification.success('Categoría actualizada con éxito');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo actualizar la categoría');
        return throwError(() => err);
      })
    );
  }

  deleteCategory(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_CONFIG.endpoints.categories}/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this._categories.update(list => list.filter(c => c.id !== id));
          this.notification.success('Categoría eliminada de Firestore');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo eliminar la categoría');
        return throwError(() => err);
      })
    );
  }
}
