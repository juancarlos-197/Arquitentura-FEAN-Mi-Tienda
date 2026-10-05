import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
      [class]="badgeClass()"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      {{ label() || status() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly label = input<string>('');

  readonly badgeClass = computed(() => {
    const s = this.status().toUpperCase();
    switch (s) {
      case 'DELIVERED':
      case 'ACTIVE':
      case 'ACTIVO':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'SHIPPED':
      case 'ENVIADO':
      case 'MANAGER':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'PROCESSING':
      case 'PROCESANDO':
      case 'ADMIN':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'PENDING':
      case 'PENDIENTE':
      case 'CUSTOMER':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'CANCELLED':
      case 'INACTIVE':
      case 'INACTIVO':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  });

  readonly dotClass = computed(() => {
    const s = this.status().toUpperCase();
    switch (s) {
      case 'DELIVERED':
      case 'ACTIVE':
      case 'ACTIVO':
        return 'bg-emerald-500';
      case 'SHIPPED':
      case 'ENVIADO':
      case 'MANAGER':
        return 'bg-blue-500';
      case 'PROCESSING':
      case 'PROCESANDO':
      case 'ADMIN':
        return 'bg-indigo-500';
      case 'PENDING':
      case 'PENDIENTE':
      case 'CUSTOMER':
        return 'bg-amber-500';
      case 'CANCELLED':
      case 'INACTIVE':
      case 'INACTIVO':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  });
}
