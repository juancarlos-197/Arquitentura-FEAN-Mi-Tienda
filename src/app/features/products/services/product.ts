import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, from, map, catchError, of, throwError } from 'rxjs';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../../core/config/firebase.config';
import { ApiResponse, Product } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';
import { Firebase } from '../../../core/services/firebase';
import { INITIAL_PRODUCTS } from '../../../shared/data/initial-products';

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
   * Obtiene la lista de productos conectándose directamente
   * a la base de datos NoSQL Cloud Firestore
   */
  loadProducts(filters?: ProductFilters): Observable<ApiResponse<Product[]>> {
    this._loading.set(true);
    this._error.set(null);

    return from(this.fetchProductsFromFirestore(filters)).pipe(
      map(prods => {
        this._loading.set(false);
        this._products.set(prods);
        return {
          success: true,
          data: prods,
          total: prods.length,
        };
      }),
      catchError(err => {
        this._loading.set(false);
        const errMsg = err?.message || 'Error al consultar Cloud Firestore';
        this._error.set(errMsg);
        this.notification.error(errMsg);
        return of({
          success: true,
          data: INITIAL_PRODUCTS,
          total: INITIAL_PRODUCTS.length,
        });
      })
    );
  }

  /**
   * Consulta directa y filtrado sobre Cloud Firestore
   */
  private async fetchProductsFromFirestore(filters?: ProductFilters): Promise<Product[]> {
    const colRef = collection(this.firebase.firestore, FIREBASE_CONFIG.collections.products);
    const snap = await getDocs(colRef);
    let list: Product[] = [];

    if (snap.empty) {
      // Auto-inicialización si la colección estuviera vacía
      list = [...INITIAL_PRODUCTS];
    } else {
      list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    }

    if (filters) {
      if (filters.activeOnly) {
        list = list.filter(p => p.active);
      }
      if (filters.categoryId && filters.categoryId !== 'all') {
        list = list.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.q) {
        const term = filters.q.toLowerCase().trim();
        list = list.filter(
          p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
        );
      }
      if (filters.minPrice !== undefined) {
        list = list.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        list = list.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            list.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            list.sort((a, b) => b.price - a.price);
            break;
          case 'name_asc':
            list.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'newest':
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'rating':
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        }
      }
    }

    return list;
  }

  /**
   * Obtiene un producto individual por ID directamente desde Firestore
   */
  getProductById(id: string): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    this._error.set(null);

    return from(getDoc(doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, id))).pipe(
      map(docSnap => {
        this._loading.set(false);
        if (docSnap.exists()) {
          const product = { id: docSnap.id, ...docSnap.data() } as Product;
          this._selectedProduct.set(product);
          return { success: true, data: product };
        }
        // Fallback a memoria
        const fallback = INITIAL_PRODUCTS.find(p => p.id === id);
        if (fallback) {
          this._selectedProduct.set(fallback);
          return { success: true, data: fallback };
        }
        throw new Error('Producto no encontrado');
      }),
      catchError(err => {
        this._loading.set(false);
        const errMsg = err?.message || 'No se pudo encontrar el producto';
        this._error.set(errMsg);
        this.notification.error(errMsg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Crea un producto directamente en Cloud Firestore
   */
  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    const id = data.id || `prod-${Date.now()}`;
    const newProduct: Product = {
      id,
      name: data.name || 'Nuevo Producto',
      description: data.description || '',
      price: data.price || 0,
      stock: data.stock || 0,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      categoryId: data.categoryId || 'cat-1',
      categoryName: data.categoryName || 'General',
      active: data.active ?? true,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, id);

    return from(setDoc(docRef, { ...newProduct, firestoreTimestamp: serverTimestamp() })).pipe(
      map(() => {
        this._loading.set(false);
        this._products.update(list => [newProduct, ...list]);
        this.notification.success('Producto creado directamente en Cloud Firestore');
        return { success: true, data: newProduct };
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err?.message || 'Error al crear producto en Firestore');
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza un producto directamente en Cloud Firestore
   */
  updateProduct(id: string, data: Partial<Product>): Observable<ApiResponse<Product>> {
    this._loading.set(true);
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, id);
    const updates = {
      ...data,
      updatedAt: new Date().toISOString(),
      firestoreUpdatedAt: serverTimestamp(),
    };

    return from(setDoc(docRef, updates, { merge: true })).pipe(
      map(() => {
        this._loading.set(false);
        this._products.update(list =>
          list.map(p => (p.id === id ? { ...p, ...data, updatedAt: updates.updatedAt } : p))
        );
        const updated = this._products().find(p => p.id === id);
        if (this._selectedProduct()?.id === id && updated) {
          this._selectedProduct.set(updated);
        }
        this.notification.success('Producto actualizado en Cloud Firestore');
        return { success: true, data: updated };
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err?.message || 'Error al actualizar producto en Firestore');
        return throwError(() => err);
      })
    );
  }

  /**
   * Elimina un producto directamente de Cloud Firestore
   */
  deleteProduct(id: string): Observable<ApiResponse> {
    this._loading.set(true);
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.products, id);

    return from(deleteDoc(docRef)).pipe(
      map(() => {
        this._loading.set(false);
        this._products.update(list => list.filter(p => p.id !== id));
        if (this._selectedProduct()?.id === id) {
          this._selectedProduct.set(null);
        }
        this.notification.success('Producto eliminado de Cloud Firestore');
        return { success: true, message: 'Producto eliminado correctamente' };
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err?.message || 'Error al eliminar producto en Firestore');
        return throwError(() => err);
      })
    );
  }

  clearSelectedProduct(): void {
    this._selectedProduct.set(null);
  }
}

export { ProductService as Products };
