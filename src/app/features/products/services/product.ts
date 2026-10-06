import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError, from, map } from 'rxjs';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { API_CONFIG } from '../../../core/config/api.config';
import { FIREBASE_CONFIG } from '../../../core/config/firebase.config';
import { ApiResponse, Product } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';
import { Firebase } from '../../../core/services/firebase';

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
  private readonly firebase = inject(Firebase);

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
   * Obtiene la lista de productos desde la API REST (Express)
   * con sincronización y fallback directo a Cloud Firestore
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

    const endpoint = API_CONFIG.endpoints.products || `${API_CONFIG.baseUrl}/products`;

    return this.http.get<ApiResponse<Product[]>>(endpoint, { params }).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._products.set(res.data);
        }
      }),
      catchError(err => {
        // Fallback resiliente: consultar directamente Cloud Firestore NoSQL
        return from(this.loadDirectFromFirestore()).pipe(
          map(prods => {
            this._loading.set(false);
            if (prods.length > 0) {
              this.notification.info('Productos cargados directamente desde Cloud Firestore');
            }
            return {
              success: true,
              data: prods,
              total: prods.length,
            };
          }),
          catchError(() => {
            this._loading.set(false);
            const errMsg = err.error?.error || 'Error al cargar productos desde la API/Firebase';
            this._error.set(errMsg);
            this.notification.error(errMsg);
            return throwError(() => err);
          })
        );
      })
    );
  }

  /**
   * Consulta directa a la colección 'products' en Cloud Firestore
   */
  async loadDirectFromFirestore(): Promise<Product[]> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const prods = await this.firebase.getFirestoreProducts();
      if (prods && prods.length > 0) {
        this._products.set(prods);
      }
      return prods || [];
    } catch (err) {
      console.error('[Firestore Direct Error]', err);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Obtiene un producto individual por ID
   */
  getProductById(id: string): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    this._error.set(null);

    const endpoint = `${API_CONFIG.endpoints.products}/${id}`;

    return this.http.get<ApiResponse<Product>>(endpoint).pipe(
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
   * Crea un nuevo producto y lo sincroniza en Cloud Firestore
   */
  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    const endpoint = API_CONFIG.endpoints.products;

    return this.http.post<ApiResponse<Product>>(endpoint, data).pipe(
      tap(async res => {
        this._loading.set(false);
        if (res.success && res.data) {
          const newProd = res.data;
          this._products.update(list => [newProd, ...list]);

          // Sincronizar en Cloud Firestore
          try {
            await setDoc(doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, newProd.id), newProd, { merge: true });
          } catch (e) {
            console.warn('[Firestore Sync Warning]', e);
          }

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
   * Actualiza un producto existente en Express y Cloud Firestore
   */
  updateProduct(id: string, data: Partial<Product>): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    const endpoint = `${API_CONFIG.endpoints.products}/${id}`;

    return this.http.put<ApiResponse<Product>>(endpoint, data).pipe(
      tap(async res => {
        this._loading.set(false);
        if (res.success && res.data) {
          const updated = res.data;
          this._products.update(list => list.map(p => (p.id === id ? updated : p)));
          if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(updated);
          }

          // Sincronizar en Cloud Firestore
          try {
            await setDoc(doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, id), updated, { merge: true });
          } catch (e) {
            console.warn('[Firestore Sync Warning]', e);
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
   * Elimina un producto y lo retira de Express y Cloud Firestore
   */
  deleteProduct(id: string): Observable<ApiResponse> {
    this._loading.set(true);
    const endpoint = `${API_CONFIG.endpoints.products}/${id}`;

    return this.http.delete<ApiResponse>(endpoint).pipe(
      tap(async res => {
        this._loading.set(false);
        if (res.success) {
          this._products.update(list => list.filter(p => p.id !== id));
          if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(null);
          }

          // Eliminar de Cloud Firestore
          try {
            await deleteDoc(doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, id));
          } catch (e) {
            console.warn('[Firestore Delete Warning]', e);
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
