import { inject, Injectable, signal } from '@angular/core';
import { Observable, from, map, catchError, of, throwError } from 'rxjs';
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../../core/config/firebase.config';
import { ApiResponse, Category } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';
import { Firebase } from '../../../core/services/firebase';

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Tecnología & Gadgets',
    description: 'Dispositivos inteligentes, accesorios de cómputo y audio de alta fidelidad.',
    icon: 'devices',
    active: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Hogar & Confort',
    description: 'Ergonomía, iluminación ambiental y confort para espacios de trabajo y descanso.',
    icon: 'home',
    active: true,
    createdAt: '2026-01-20T11:30:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Café & Gourmet',
    description: 'Café de especialidad, métodos de extracción y equipamiento barista profesional.',
    icon: 'coffee',
    active: true,
    createdAt: '2026-01-25T08:00:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'Moda & Accesorios',
    description: 'Mochilas funcionales, carteras minimalistas y accesorios de viaje duraderos.',
    icon: 'backpack',
    active: true,
    createdAt: '2026-02-01T09:15:00.000Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class Categories {
  private readonly notification = inject(Notification);
  private readonly firebase = inject(Firebase);

  private readonly _categories = signal<Category[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadCategories(): Observable<ApiResponse<Category[]>> {
    this._loading.set(true);
    const colRef = collection(this.firebase.firestore, FIREBASE_CONFIG.collections.categories);

    return from(getDocs(colRef)).pipe(
      map(snap => {
        this._loading.set(false);
        let list: Category[] = [];
        if (snap.empty) {
          list = [...INITIAL_CATEGORIES];
        } else {
          list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        }
        this._categories.set(list);
        return { success: true, data: list, total: list.length };
      }),
      catchError(() => {
        this._loading.set(false);
        this._categories.set(INITIAL_CATEGORIES);
        return of({ success: true, data: INITIAL_CATEGORIES, total: INITIAL_CATEGORIES.length });
      })
    );
  }

  createCategory(data: Partial<Category>): Observable<ApiResponse<Category>> {
    const id = data.id || `cat-${Date.now()}`;
    const newCategory: Category = {
      id,
      name: data.name || 'Nueva Categoría',
      description: data.description || '',
      icon: data.icon || 'folder',
      active: data.active ?? true,
      createdAt: new Date().toISOString(),
    };

    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.categories, id);

    return from(setDoc(docRef, { ...newCategory, timestamp: serverTimestamp() })).pipe(
      map(() => {
        this._categories.update(list => [...list, newCategory]);
        this.notification.success('Categoría guardada en Cloud Firestore');
        return { success: true, data: newCategory };
      }),
      catchError(err => {
        this.notification.error(err?.message || 'No se pudo crear la categoría');
        return throwError(() => err);
      })
    );
  }

  updateCategory(id: string, data: Partial<Category>): Observable<ApiResponse<Category>> {
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.categories, id);

    return from(setDoc(docRef, data, { merge: true })).pipe(
      map(() => {
        this._categories.update(list => list.map(c => (c.id === id ? { ...c, ...data } : c)));
        this.notification.success('Categoría actualizada en Cloud Firestore');
        const updated = this._categories().find(c => c.id === id);
        return { success: true, data: updated };
      }),
      catchError(err => {
        this.notification.error(err?.message || 'No se pudo actualizar la categoría');
        return throwError(() => err);
      })
    );
  }

  deleteCategory(id: string): Observable<ApiResponse> {
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.categories, id);

    return from(deleteDoc(docRef)).pipe(
      map(() => {
        this._categories.update(list => list.filter(c => c.id !== id));
        this.notification.success('Categoría eliminada de Cloud Firestore');
        return { success: true, message: 'Categoría eliminada' };
      }),
      catchError(err => {
        this.notification.error(err?.message || 'No se pudo eliminar la categoría');
        return throwError(() => err);
      })
    );
  }
}
