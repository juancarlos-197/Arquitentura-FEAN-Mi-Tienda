import { computed, inject, Injectable, signal } from '@angular/core';
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
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  // Signals para gestionar el estado reactivo
  private readonly _products = signal<Product[]>([]);
  private readonly _selectedProduct = signal<Product | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Señales públicas de solo lectura
  readonly products = this._products.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Señal computada para métricas del catálogo
  readonly totalProducts = computed(() => this._products().length);

  /**
   * Obtiene la lista de productos desde la API / Firebase
   * y actualiza el signal `products`
   */
  loadProducts(filters?: ProductFilters): Observable<ApiResponse<Product[]>> {
    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams();
    if (filters) {
      if (filters.q) params = params.set('q', filters.q);
      if (filters.categoryId && filters.categoryId !== 'all') {
        params = params.set('categoryId', filters.categoryId);
      }
      if (filters.minPrice !== undefined) {
        params = params.set('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params = params.set('maxPrice', filters.maxPrice.toString());
      }
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.activeOnly !== undefined) {
        params = params.set('activeOnly', filters.activeOnly.toString());
      }
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
        const errMsg = err.error?.error || 'Error al cargar productos desde la API/Firebase';
        this._error.set(errMsg);
        this.notification.error(errMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene un producto individual por ID
   */
  getProductById(id: string): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<ApiResponse<Product>>(`${API_CONFIG.endpoints.products}/${id}`).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._selectedProduct.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        const errMsg = err.error?.error || 'No se pudo encontrar el producto solicitado';
        this._error.set(errMsg);
        this.notification.error(errMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Crea un nuevo producto y lo agrega al signal `products`
   */
  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    return this.http.post<ApiResponse<Product>>(API_CONFIG.endpoints.products, data).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._products.update(list => [res.data!, ...list]);
          this.notification.success('Producto creado y sincronizado en Firestore');
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err.error?.error || 'Error al crear el producto');
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza un producto existente en backend y actualiza los signals
   */
  updateProduct(id: string, data: Partial<Product>): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    return this.http.put<ApiResponse<Product>>(`${API_CONFIG.endpoints.products}/${id}`, data).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._products.update(list => list.map(p => (p.id === id ? res.data! : p)));
          if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(res.data);
          }
          this.notification.success('Producto actualizado en Express y Firestore');
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err.error?.error || 'Error al actualizar el producto');
        return throwError(() => err);
      })
    );
  }

  /**
   * Elimina un producto y lo retira del signal `products`
   */
  deleteProduct(id: string): Observable<ApiResponse> {
    this._loading.set(true);
    return this.http.delete<ApiResponse>(`${API_CONFIG.endpoints.products}/${id}`).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success) {
          this._products.update(list => list.filter(p => p.id !== id));
          if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(null);
          }
          this.notification.success('Producto eliminado de la base de datos');
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err.error?.error || 'Error al eliminar el producto');
        return throwError(() => err);
      })
    );
  }

  /**
   * Limpia la selección activa de producto
   */
  clearSelectedProduct(): void {
    this._selectedProduct.set(null);
  }
}

// Exportamos también el alias Products para compatibilidad con código existente
export { ProductService as Products };
