import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, Product } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';

export interface ProductFilters {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest' | 'rating';
  activeOnly?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Products {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  private readonly _products = signal<Product[]>([]);
  private readonly _selectedProduct = signal<Product | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly products = this._products.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadProducts(filters?: ProductFilters): Observable<ApiResponse<Product[]>> {
    this._loading.set(true);

    let params = new HttpParams();
    if (filters) {
      if (filters.q) params = params.set('q', filters.q);
      if (filters.categoryId && filters.categoryId !== 'all') params = params.set('categoryId', filters.categoryId);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.activeOnly !== undefined) params = params.set('activeOnly', filters.activeOnly.toString());
    }

    return this.http.get<ApiResponse<Product[]>>(API_CONFIG.endpoints.products, { params }).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._products.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('Error al cargar productos');
        return throwError(() => err);
      })
    );
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    return this.http.get<ApiResponse<Product>>(`${API_CONFIG.endpoints.products}/${id}`).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._selectedProduct.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('No se pudo encontrar el producto');
        return throwError(() => err);
      })
    );
  }

  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(API_CONFIG.endpoints.products, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._products.update(list => [res.data!, ...list]);
          this.notification.success('Producto creado y sincronizado en Firestore');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'Error al crear el producto');
        return throwError(() => err);
      })
    );
  }

  updateProduct(id: string, data: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${API_CONFIG.endpoints.products}/${id}`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._products.update(list => list.map(p => (p.id === id ? res.data! : p)));
          if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(res.data);
          }
          this.notification.success('Producto actualizado en Express y Firestore');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'Error al actualizar el producto');
        return throwError(() => err);
      })
    );
  }

  deleteProduct(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_CONFIG.endpoints.products}/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this._products.update(list => list.filter(p => p.id !== id));
          if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(null);
          }
          this.notification.success('Producto eliminado de la base de datos');
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'Error al eliminar el producto');
        return throwError(() => err);
      })
    );
  }
}
