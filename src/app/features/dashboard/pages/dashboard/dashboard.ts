import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Dashboard } from '../../services/dashboard';
import { Auth } from '../../../../core/services/auth';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeader,
    StatusBadge,
    LoadingSpinner,
    CurrencyFormatPipe,
    TimeAgoPipe,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Panel de Control Empresarial"
        subtitle="Métricas centralizadas en Express con persistencia NoSQL en Firebase"
        icon="dashboard"
      >
        <div class="flex items-center gap-2">
          <button
            mat-stroked-button
            class="rounded-xl"
            (click)="dashboardService.loadSummary().subscribe()"
          >
            <mat-icon class="mr-1">refresh</mat-icon>
            Actualizar Datos
          </button>
          <a routerLink="/architecture" mat-flat-button color="primary" class="rounded-xl shadow-xs">
            <mat-icon class="mr-1">account_tree</mat-icon>
            Ver Arquitectura FEAN
          </a>
        </div>
      </app-page-header>

      @if (dashboardService.loading() && !summary()) {
        <app-loading-spinner message="Calculando agregaciones de Firestore..."></app-loading-spinner>
      } @else if (summary()) {
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Total Sales -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Ventas Netas</span>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {{ summary()!.totalSales | currencyFormat }}
              </div>
              <span class="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <mat-icon class="text-xs">trending_up</mat-icon> +18.4% este mes
              </span>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <mat-icon class="text-2xl">payments</mat-icon>
            </div>
          </div>

          <!-- Total Orders -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Pedidos Totales</span>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {{ summary()!.totalOrders }}
              </div>
              <span class="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                <mat-icon class="text-xs">shopping_bag</mat-icon> Procesados en Express
              </span>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <mat-icon class="text-2xl">local_shipping</mat-icon>
            </div>
          </div>

          <!-- Products in Catalog -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Productos Activos</span>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {{ summary()!.totalProducts }}
              </div>
              <span class="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                <mat-icon class="text-xs">inventory_2</mat-icon> Colección 'products'
              </span>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <mat-icon class="text-2xl">category</mat-icon>
            </div>
          </div>

          <!-- Registered Users -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Usuarios RBAC</span>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {{ summary()!.totalUsers }}
              </div>
              <span class="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                <mat-icon class="text-xs">verified_user</mat-icon> Firebase Auth
              </span>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <mat-icon class="text-2xl">people</mat-icon>
            </div>
          </div>
        </div>

        <!-- Middle Section: Categories Breakdown & Monthly Trend -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Category Sales Distribution -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2 space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 class="font-bold text-base text-slate-900">Ventas por Categoría de Catálogo</h3>
                <p class="text-xs text-slate-400">Distribución de ingresos en tiempo real</p>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                Firestore Aggregation
              </span>
            </div>

            <div class="space-y-4">
              @for (cat of summary()!.salesByCategory; track cat.categoryId) {
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs font-semibold">
                    <span class="text-slate-800">{{ cat.categoryName }}</span>
                    <span class="text-slate-900">{{ cat.amount | currencyFormat }} ({{ cat.percentage }}%)</span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="cat.percentage"
                    class="rounded-full h-2"
                  ></mat-progress-bar>
                </div>
              }
            </div>
          </div>

          <!-- Monthly Growth Snapshot -->
          <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div class="pb-3 border-b border-slate-100">
              <h3 class="font-bold text-base text-slate-900">Histórico de Facturación</h3>
              <p class="text-xs text-slate-400">Últimos meses registrados</p>
            </div>

            <div class="space-y-3">
              @for (m of summary()!.monthlySales; track m.month) {
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {{ m.month }}
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900">{{ m.orders }} pedidos</div>
                      <div class="text-[10px] text-slate-400">Cierre mensual</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-extrabold text-slate-900 block">{{ m.revenue | currencyFormat }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base text-slate-900">Últimos Pedidos Recibidos</h3>
              <p class="text-xs text-slate-400">Operaciones en cola de procesamiento</p>
            </div>
            <a routerLink="/orders" mat-stroked-button class="rounded-xl text-xs">
              Ver todos los pedidos
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th class="py-3 px-5">Pedido</th>
                  <th class="py-3 px-5">Cliente</th>
                  <th class="py-3 px-5">Fecha</th>
                  <th class="py-3 px-5">Total</th>
                  <th class="py-3 px-5">Estado</th>
                  <th class="py-3 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                @for (order of summary()!.recentOrders; track order.id) {
                  <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-3.5 px-5 font-mono font-bold text-indigo-600">
                      #{{ order.id }}
                    </td>
                    <td class="py-3.5 px-5">
                      <div class="font-semibold text-slate-900">{{ order.customerName }}</div>
                      <div class="text-xs text-slate-400">{{ order.customerEmail }}</div>
                    </td>
                    <td class="py-3.5 px-5 text-xs text-slate-500">
                      {{ order.createdAt | timeAgo }}
                    </td>
                    <td class="py-3.5 px-5 font-bold text-slate-900">
                      {{ order.total | currencyFormat }}
                    </td>
                    <td class="py-3.5 px-5">
                      <app-status-badge [status]="order.status"></app-status-badge>
                    </td>
                    <td class="py-3.5 px-5 text-right">
                      <a [routerLink]="['/orders', order.id]" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                        Ver detalle →
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardPage implements OnInit {
  readonly dashboardService = inject(Dashboard);
  readonly auth = inject(Auth);

  readonly summary = this.dashboardService.summary;

  ngOnInit(): void {
    this.dashboardService.loadSummary().subscribe();
  }
}
