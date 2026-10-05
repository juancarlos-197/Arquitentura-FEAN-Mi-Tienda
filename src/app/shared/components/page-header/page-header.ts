import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        @if (icon()) {
          <div class="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
            <mat-icon class="text-2xl">{{ icon() }}</mat-icon>
          </div>
        }
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="text-sm text-slate-500 mt-0.5">{{ subtitle() }}</p>
          }
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
}
