import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Orders } from '../../services/orders';
import { Auth } from '../../../../core/services/auth';
import { OrderStatus } from '../../../../shared/models';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    StatusBadge,
    LoadingSpinner,
    EmptyState,
    CurrencyFormatPipe,
    TimeAgoPipe,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <a routerLink="/orders" class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <mat-icon class="text-sm">arrow_back</mat-icon>
          Volver a Pedidos
        </a>

        @if (order() && (auth.isAdmin() || auth.isManager())) {
          <div class="flex items-center gap-2">
            <button
              mat-stroked-button
              [matMenuTriggerFor]="statusMenu"
              class="rounded-xl"
            >
              <mat-icon class="mr-1">edit_attributes</mat-icon>
              Actualizar Estado ({{ order()!.status }})
            </button>

            <mat-menu #statusMenu="matMenu">
              <button mat-menu-item (click)="updateStatus('PENDING')">Pendiente</button>
              <button mat-menu-item (click)="updateStatus('PROCESSING')">En Proceso</button>
              <button mat-menu-item (click)="updateStatus('SHIPPED')">Enviado</button>
              <button mat-menu-item (click)="updateStatus('DELIVERED')">Entregado</button>
              <button mat-menu-item (click)="updateStatus('CANCELLED')">Cancelar</button>
            </mat-menu>
          </div>
        }
      </div>

      @if (ordersService.loading()) {
        <app-loading-spinner message="Cargando factura del pedido..."></app-loading-spinner>
      } @else if (!order()) {
        <app-empty-state
          icon="receipt"
          title="Pedido no encontrado"
          description="El pedido especificado no existe en la base de datos de Firebase."
        ></app-empty-state>
      } @else {
        <!-- Order Receipt Card -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8">
          <!-- Header Info -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">Pedido #{{ order()!.id }}</h1>
                <app-status-badge [status]="order()!.status"></app-status-badge>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Registrado el {{ formatDate(order()!.createdAt) }} ({{ order()!.createdAt | timeAgo }})
              </p>
            </div>

            <div class="text-right sm:text-right">
              <span class="text-xs text-slate-400 block font-medium">Total Facturado</span>
              <span class="text-3xl font-black text-indigo-600">
                {{ order()!.total | currencyFormat }}
              </span>
            </div>
          </div>

          <!-- Customer and Delivery Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div class="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <mat-icon class="text-sm">person</mat-icon>
                Datos del Cliente
              </div>
              <p class="font-bold text-slate-900 text-sm">{{ order()!.customerName }}</p>
              <p class="text-xs text-slate-600">{{ order()!.customerEmail }}</p>
              <p class="text-xs text-slate-400">ID Cliente: {{ order()!.customerId }}</p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div class="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <mat-icon class="text-sm">local_shipping</mat-icon>
                Entrega & Pago
              </div>
              <p class="font-bold text-slate-900 text-sm">{{ order()!.shippingAddress }}</p>
              <p class="text-xs text-slate-600">Método de Pago: {{ order()!.paymentMethod }}</p>
              @if (order()!.notes) {
                <p class="text-xs text-slate-500 italic">Notas: "{{ order()!.notes }}"</p>
              }
            </div>
          </div>

          <!-- Items Breakdown -->
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Artículos del Pedido</h3>
            <div class="rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
              @for (item of order()!.items; track item.productId) {
                <div class="p-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'"
                      [alt]="item.productName"
                      referrerpolicy="no-referrer"
                      class="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <span class="font-bold text-slate-900 text-sm block">{{ item.productName }}</span>
                      <span class="text-xs text-slate-500">
                        {{ item.quantity }} x {{ item.productPrice | currencyFormat }}
                      </span>
                    </div>
                  </div>

                  <div class="text-right">
                    <span class="font-extrabold text-sm text-slate-900 block">
                      {{ item.subtotal | currencyFormat }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Total Calculation Footer -->
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <div class="w-64 space-y-2 text-sm">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal productos</span>
                <span class="font-semibold">{{ order()!.total | currencyFormat }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Gastos de transporte</span>
                <span class="font-semibold text-emerald-600">Gratuito</span>
              </div>
              <div class="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Factura</span>
                <span class="text-indigo-600">{{ order()!.total | currencyFormat }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly ordersService = inject(Orders);
  readonly auth = inject(Auth);

  readonly order = this.ordersService.selectedOrder;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ordersService.getOrderById(id).subscribe();
    }
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  }

  updateStatus(status: OrderStatus): void {
    const o = this.order();
    if (o) {
      this.ordersService.updateOrderStatus(o.id, status).subscribe();
    }
  }
}
