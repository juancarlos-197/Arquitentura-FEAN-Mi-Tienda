import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
        <mat-icon class="text-3xl">{{ icon() }}</mat-icon>
      </div>
      <h3 class="text-lg font-semibold text-slate-800 mb-1">{{ title() }}</h3>
      <p class="text-sm text-slate-500 max-w-sm mb-5">{{ description() }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyState {
  readonly icon = input<string>('inventory_2');
  readonly title = input<string>('No hay elementos para mostrar');
  readonly description = input<string>('No se encontraron registros que coincidan con la búsqueda.');
}
