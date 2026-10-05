import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, Order, OrderStatus } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';

@Injectable({
  providedIn: 'root',
})
export class Orders {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  private readonly _orders = signal<Order[]>([]);
  private readonly _selectedOrder = signal<Order | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly orders = this._orders.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadOrders(filters?: { customerId?: string; status?: string }): Observable<ApiResponse<Order[]>> {
    this._loading.set(true);

    let params = new HttpParams();
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    if (filters?.status && filters.status !== 'all') params = params.set('status', filters.status);

    return this.http.get<ApiResponse<Order[]>>(API_CONFIG.endpoints.orders, { params }).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._orders.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('Error al consultar pedidos');
        return throwError(() => err);
      })
    );
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    this._loading.set(true);
    return this.http.get<ApiResponse<Order>>(`${API_CONFIG.endpoints.orders}/${id}`).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._selectedOrder.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('No se pudo encontrar el pedido');
        return throwError(() => err);
      })
    );
  }

  createOrder(data: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(API_CONFIG.endpoints.orders, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._orders.update(list => [res.data!, ...list]);
          this.notification.success(`¡Pedido #${res.data.id} creado con éxito en Firebase!`);
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'No se pudo procesar el pedido');
        return throwError(() => err);
      })
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${API_CONFIG.endpoints.orders}/${id}/status`, { status }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this._orders.update(list => list.map(o => (o.id === id ? res.data! : o)));
          if (this._selectedOrder()?.id === id) {
            this._selectedOrder.set(res.data);
          }
          this.notification.success(`Estado actualizado a ${status}`);
        }
      }),
      catchError(err => {
        this.notification.error(err.error?.error || 'Error al actualizar el estado del pedido');
        return throwError(() => err);
      })
    );
  }
}
