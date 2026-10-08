import { inject, Injectable, signal } from '@angular/core';
import { Observable, from, map, catchError, of, throwError } from 'rxjs';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../../core/config/firebase.config';
import { ApiResponse, Order, OrderStatus } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';
import { Firebase } from '../../../core/services/firebase';

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    customerId: 'user-customer-1',
    customerName: 'Javier Alban',
    customerEmail: 'jalban.dacompsc@gmail.com',
    items: [
      {
        productId: 'prod-1',
        productName: 'Audífonos Noise-Cancelling Pro Apex',
        productPrice: 249.99,
        quantity: 1,
        subtotal: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      },
    ],
    total: 249.99,
    status: 'DELIVERED',
    shippingAddress: 'Av. Diagonal 450, 08006 Barcelona, España',
    paymentMethod: 'Tarjeta de Crédito',
    notes: 'Entregado en recepción con firma digital.',
    createdAt: '2026-02-25T14:30:00.000Z',
    updatedAt: '2026-02-27T18:00:00.000Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class Orders {
  private readonly notification = inject(Notification);
  private readonly firebase = inject(Firebase);

  private readonly _orders = signal<Order[]>([]);
  private readonly _selectedOrder = signal<Order | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly orders = this._orders.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadOrders(filters?: { customerId?: string; status?: string }): Observable<ApiResponse<Order[]>> {
    this._loading.set(true);
    const colRef = collection(this.firebase.firestore, FIREBASE_CONFIG.collections.orders);

    return from(getDocs(colRef)).pipe(
      map(snap => {
        this._loading.set(false);
        let list: Order[] = [];
        if (snap.empty) {
          list = [...INITIAL_ORDERS];
        } else {
          list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        }

        if (filters?.customerId) {
          list = list.filter(o => o.customerId === filters.customerId);
        }
        if (filters?.status && filters.status !== 'all') {
          list = list.filter(o => o.status === filters.status);
        }

        this._orders.set(list);
        return { success: true, data: list, total: list.length };
      }),
      catchError(() => {
        this._loading.set(false);
        this._orders.set(INITIAL_ORDERS);
        return of({ success: true, data: INITIAL_ORDERS, total: INITIAL_ORDERS.length });
      })
    );
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    this._loading.set(true);
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.orders, id);

    return from(getDoc(docRef)).pipe(
      map(snap => {
        this._loading.set(false);
        if (snap.exists()) {
          const order = { id: snap.id, ...snap.data() } as Order;
          this._selectedOrder.set(order);
          return { success: true, data: order };
        }
        const fallback = INITIAL_ORDERS.find(o => o.id === id);
        if (fallback) {
          this._selectedOrder.set(fallback);
          return { success: true, data: fallback };
        }
        throw new Error('Pedido no encontrado');
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('No se pudo encontrar el pedido');
        return throwError(() => err);
      })
    );
  }

  createOrder(orderData: Partial<Order>): Observable<ApiResponse<Order>> {
    this._loading.set(true);
    const id = orderData.id || `ORD-${Date.now()}`;
    const items = orderData.items || [];
    const total = orderData.total ?? items.reduce((acc, item) => acc + (item.subtotal || item.productPrice * item.quantity), 0);

    const newOrder: Order = {
      id,
      customerId: orderData.customerId || 'user-customer-1',
      customerName: orderData.customerName || 'Cliente',
      customerEmail: orderData.customerEmail || 'cliente@mitienda.com',
      items,
      total,
      status: orderData.status || 'PENDING',
      shippingAddress: orderData.shippingAddress || '',
      paymentMethod: orderData.paymentMethod || 'Tarjeta',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.orders, id);

    return from(setDoc(docRef, { ...newOrder, timestamp: serverTimestamp() })).pipe(
      map(() => {
        this._loading.set(false);
        this._orders.update(list => [newOrder, ...list]);
        this.notification.success(`Pedido ${id} registrado en Cloud Firestore`);
        return { success: true, data: newOrder };
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err?.message || 'Error al procesar el pedido');
        return throwError(() => err);
      })
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<ApiResponse<Order>> {
    this._loading.set(true);
    const docRef = doc(this.firebase.firestore, FIREBASE_CONFIG.collections.orders, id);
    const updates = { status, updatedAt: new Date().toISOString() };

    return from(setDoc(docRef, updates, { merge: true })).pipe(
      map(() => {
        this._loading.set(false);
        this._orders.update(list =>
          list.map(o => (o.id === id ? { ...o, status, updatedAt: updates.updatedAt } : o))
        );
        const updated = this._orders().find(o => o.id === id);
        if (this._selectedOrder()?.id === id && updated) {
          this._selectedOrder.set(updated);
        }
        this.notification.success(`Estado actualizado a ${status} en Firestore`);
        return { success: true, data: updated };
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error(err?.message || 'No se pudo actualizar el pedido');
        return throwError(() => err);
      })
    );
  }
}
