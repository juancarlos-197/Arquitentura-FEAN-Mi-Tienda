import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <mat-spinner [diameter]="diameter()" strokeWidth="3" class="mb-3 text-indigo-600"></mat-spinner>
      @if (message()) {
        <p class="text-sm font-medium text-slate-500 animate-pulse">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingSpinner {
  readonly message = input<string>('Cargando información...');
  readonly diameter = input<number>(40);
}
