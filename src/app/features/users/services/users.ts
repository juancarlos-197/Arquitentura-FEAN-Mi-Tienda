import { inject, Injectable, signal } from '@angular/core';
import { Observable, from, map, catchError, of, throwError } from 'rxjs';
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../../core/config/firebase.config';
import { ApiResponse, User } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';
import { Firebase } from '../../../core/services/firebase';

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Carlos Mendoza (Admin)',
    email: 'admin@mitienda.com',
    role: 'ADMIN',
    active: true,
    phone: '+34 611 223 344',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user-manager',
    name: 'Elena Rodríguez (Manager)',
    email: 'manager@mitienda.com',
    role: 'MANAGER',
    active: true,
    phone: '+34 622 334 455',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2026-01-05T09:30:00.000Z',
    updatedAt: '2026-01-05T09:30:00.000Z',
  },
  {
    id: 'user-customer-1',
    name: 'Javier Alban',
    email: 'jalban.dacompsc@gmail.com',
    role: 'CUSTOMER',
    active: true,
    phone: '+34 633 445 566',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-01-10T11:00:00.000Z',
    updatedAt: '2026-01-10T11:00:00.000Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class Users {
  private readonly notification = inject(Notification);
  private readonly firebase = inject(Firebase);

  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadUsers(): Observable<ApiResponse<User[]>> {
    this._loading.set(true);
    const colRef = collection(this.firebase.firestore, FIREBASE_CONFIG.collections.users);

    return from(getDocs(colRef)).pipe(
      map(snap => {
        this._loading.set(false);
        let list: User[] = [];
        if (snap.empty) {
          list = [...INITIAL_USERS];
        } else {
          list = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        }
        this._users.set(list);
        return { success: true, data: list, total: list.length };
      }),
      catchError(() => {
        this._loading.set(false);
        this._users.set(INITIAL_USERS);
        return of({ success: true, data: INITIAL_USERS, total: INITIAL_USERS.length });
      })
    );
  }

  createUser(data: Partial<User>): Observable<ApiResponse<User>> {
    const id = data.id || `user-${Date.now()}`;
    const newUser: User = {
      id,
      name: data.name || 'Nuevo Usuario',
      email: data.email || 'usuario@mitienda.com',
      role: data.role || 'CUSTOMER',
      active: data.active ?? true,
      phone: data.phone || '',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.users, id);

    return from(setDoc(docRef, { ...newUser, timestamp: serverTimestamp() })).pipe(
      map(() => {
        this._users.update(list => [newUser, ...list]);
        this.notification.success('Usuario registrado en Cloud Firestore');
        return { success: true, data: newUser };
      }),
      catchError(err => {
        this.notification.error(err?.message || 'No se pudo crear el usuario');
        return throwError(() => err);
      })
    );
  }

  updateUser(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.users, id);

    return from(setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true })).pipe(
      map(() => {
        this._users.update(list => list.map(u => (u.id === id ? { ...u, ...data } : u)));
        this.notification.success('Usuario actualizado en Cloud Firestore');
        const updated = this._users().find(u => u.id === id);
        return { success: true, data: updated };
      }),
      catchError(err => {
        this.notification.error(err?.message || 'No se pudo actualizar el usuario');
        return throwError(() => err);
      })
    );
  }

  deleteUser(id: string): Observable<ApiResponse> {
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.users, id);

    return from(deleteDoc(docRef)).pipe(
      map(() => {
        this._users.update(list => list.filter(u => u.id !== id));
        this.notification.success('Usuario eliminado de Cloud Firestore');
        return { success: true, message: 'Usuario eliminado' };
      }),
      catchError(err => {
        this.notification.error(err?.message || 'No se pudo eliminar el usuario');
        return throwError(() => err);
      })
    );
  }
}
