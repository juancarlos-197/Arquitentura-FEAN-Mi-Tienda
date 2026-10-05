import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { Orders } from '../../services/orders';
import { Auth } from '../../../../core/services/auth';
import { Order, OrderStatus } from '../../../../shared/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-orders-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    PageHeader,
    StatusBadge,
    EmptyState,
    LoadingSpinner,
    CurrencyFormatPipe,
    TimeAgoPipe,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Historial de Pedidos"
        subtitle="Registro transaccional de órdenes almacenadas en Cloud Firestore"
        icon="receipt_long"
      >
        <a routerLink="/products" mat-stroked-button class="rounded-xl">
          <mat-icon class="mr-1">store</mat-icon>
          Ir a la Tienda
        </a>
      </app-page-header>

      <!-- Filter Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="w-full sm:w-72">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Buscar por ID, cliente o correo..."
            />
            <mat-icon matPrefix class="text-slate-400 mr-2">search</mat-icon>
          </mat-form-field>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="w-full sm:w-52">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-select [formControl]="statusFilter">
                <mat-option value="all">Todos los estados</mat-option>
                <mat-option value="PENDING">Pendientes</mat-option>
                <mat-option value="PROCESSING">En Proceso</mat-option>
                <mat-option value="SHIPPED">Enviados</mat-option>
                <mat-option value="DELIVERED">Entregados</mat-option>
                <mat-option value="CANCELLED">Cancelados</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      @if (ordersService.loading()) {
        <app-loading-spinner message="Consultando pedidos en Firebase Firestore..."></app-loading-spinner>
      } @else if (filteredOrders().length === 0) {
        <app-empty-state
          icon="shopping_bag"
          title="No hay pedidos registrados"
          description="No se han encontrado pedidos según el filtro seleccionado."
        >
          <a routerLink="/products" mat-flat-button color="primary" class="rounded-xl mt-3">
            Realizar un nuevo pedido
          </a>
        </app-empty-state>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="filteredOrders()" class="w-full">
              <!-- Order ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Pedido</th>
                <td mat-cell *matCellDef="let o" class="py-3">
                  <a [routerLink]="['/orders', o.id]" class="font-mono font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    #{{ o.id }}
                  </a>
                  <div class="text-[11px] text-slate-400 mt-0.5">{{ o.createdAt | timeAgo }}</div>
                </td>
              </ng-container>

              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Cliente</th>
                <td mat-cell *matCellDef="let o">
                  <div class="font-semibold text-slate-900">{{ o.customerName }}</div>
                  <div class="text-xs text-slate-500">{{ o.customerEmail }}</div>
                </td>
              </ng-container>

              <!-- Items Preview Column -->
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Artículos</th>
                <td mat-cell *matCellDef="let o">
                  <div class="text-xs text-slate-700 font-medium">
                    {{ o.items.length }} {{ o.items.length === 1 ? 'producto' : 'productos' }}
                  </div>
                  <div class="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                    {{ getItemNames(o) }}
                  </div>
                </td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Total</th>
                <td mat-cell *matCellDef="let o" class="font-black text-slate-900">
                  {{ o.total | currencyFormat }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Estado</th>
                <td mat-cell *matCellDef="let o">
                  <app-status-badge
                    [status]="o.status"
                    [label]="getStatusLabel(o.status)"
                  ></app-status-badge>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700 text-right pr-6">Acciones</th>
                <td mat-cell *matCellDef="let o" class="text-right pr-6">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      [routerLink]="['/orders', o.id]"
                      mat-icon-button
                      color="primary"
                      matTooltip="Ver detalle de factura"
                    >
                      <mat-icon>visibility</mat-icon>
                    </a>

                    @if (auth.isAdmin() || auth.isManager()) {
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="statusMenu"
                        matTooltip="Cambiar estado"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>

                      <mat-menu #statusMenu="matMenu">
                        <button mat-menu-item (click)="changeStatus(o.id, 'PENDING')">
                          <mat-icon class="text-amber-500">hourglass_top</mat-icon>
                          <span>Pendiente</span>
                        </button>
                        <button mat-menu-item (click)="changeStatus(o.id, 'PROCESSING')">
                          <mat-icon class="text-blue-500">sync</mat-icon>
                          <span>En Proceso</span>
                        </button>
                        <button mat-menu-item (click)="changeStatus(o.id, 'SHIPPED')">
                          <mat-icon class="text-indigo-500">local_shipping</mat-icon>
                          <span>Enviado</span>
                        </button>
                        <button mat-menu-item (click)="changeStatus(o.id, 'DELIVERED')">
                          <mat-icon class="text-emerald-500">done_all</mat-icon>
                          <span>Entregado</span>
                        </button>
                        <button mat-menu-item (click)="changeStatus(o.id, 'CANCELLED')">
                          <mat-icon class="text-rose-500">cancel</mat-icon>
                          <span>Cancelar pedido</span>
                        </button>
                      </mat-menu>
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns" class="bg-slate-50/80 border-b border-slate-200"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;" class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrdersList implements OnInit {
  readonly ordersService = inject(Orders);
  readonly auth = inject(Auth);

  readonly columns = ['id', 'customer', 'items', 'total', 'status', 'actions'];
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly statusFilter = new FormControl<string>('all', { nonNullable: true });

  readonly filteredOrders = computed(() => {
    let list = this.ordersService.orders();
    const query = this.searchControl.value.toLowerCase().trim();
    const status = this.statusFilter.value;

    if (status !== 'all') {
      list = list.filter(o => o.status === status);
    }

    if (query) {
      list = list.filter(
        o =>
          o.id.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerEmail.toLowerCase().includes(query)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.ordersService.loadOrders().subscribe();
  }

  getItemNames(order: Order): string {
    return order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PROCESSING': return 'En Proceso';
      case 'SHIPPED': return 'Enviado';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
    }
  }

  changeStatus(orderId: string, newStatus: OrderStatus): void {
    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe();
  }
}
