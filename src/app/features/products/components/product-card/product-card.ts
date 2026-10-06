import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product } from '../../../../shared/models';
import { Cart } from '../../../cart/services/cart';
import { Auth } from '../../../../core/services/auth';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      <!-- Top Image Container -->
      <a [routerLink]="['/products', product().id]" class="block relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          (error)="onImageError($event)"
        />

        <!-- Subtle gradient overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        <!-- Category Badge -->
        <span class="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-white/60 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          {{ product().categoryName || 'General' }}
        </span>

        <!-- Stock Status Badge -->
        <span
          class="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md"
          [class]="stockBadgeClass()"
        >
          {{ stockBadgeText() }}
        </span>
      </a>

      <!-- Card Body -->
      <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <!-- Rating badge -->
          <div class="flex items-center gap-1.5 mb-2">
            <div class="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200/60">
              <mat-icon class="text-amber-500 text-xs leading-none">star</mat-icon>
              <span>{{ product().rating || 4.8 }}</span>
            </div>
            <span class="text-[11px] text-slate-400 font-medium">({{ product().reviewsCount || 42 }} reseñas)</span>
          </div>

          <!-- Product Title -->
          <a [routerLink]="['/products', product().id]" class="group/title block">
            <h3 class="font-extrabold text-base text-slate-900 group-hover/title:text-indigo-600 transition-colors line-clamp-1 tracking-tight mb-1.5">
              {{ product().name }}
            </h3>
          </a>

          <!-- Description -->
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {{ product().description }}
          </p>
        </div>

        <!-- Footer / Price & Action -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span class="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Precio</span>
            <span class="text-xl font-black text-slate-900 tracking-tight">
              {{ product().price | currencyFormat }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            @if (auth.isAdmin() || auth.isManager()) {
              <button
                type="button"
                mat-icon-button
                class="!w-8 !h-8 !leading-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                (click)="editClicked.emit(product())"
                matTooltip="Editar producto"
              >
                <mat-icon class="text-base">edit</mat-icon>
              </button>
            }

            @if (auth.isAdmin()) {
              <button
                type="button"
                mat-icon-button
                class="!w-8 !h-8 !leading-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                (click)="deleteClicked.emit(product())"
                matTooltip="Eliminar producto"
              >
                <mat-icon class="text-base">delete</mat-icon>
              </button>
            }

            <button
              type="button"
              (click)="onAddToCart($event)"
              [disabled]="product().stock <= 0"
              class="px-3.5 py-2 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <mat-icon class="text-sm">shopping_cart</mat-icon>
              <span>Añadir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly editClicked = output<Product>();
  readonly deleteClicked = output<Product>();

  readonly cart = inject(Cart);
  readonly auth = inject(Auth);

  readonly stockBadgeText = computed(() => {
    const s = this.product().stock;
    if (s <= 0) return 'Agotado';
    if (s < 5) return `¡Últimas ${s}!`;
    return 'En Stock';
  });

  readonly stockBadgeClass = computed(() => {
    const s = this.product().stock;
    if (s <= 0) return 'bg-rose-500/90 text-white border border-rose-400/40';
    if (s < 5) return 'bg-amber-500/90 text-white border border-amber-400/40 animate-pulse';
    return 'bg-emerald-600/90 text-white border border-emerald-400/40';
  });

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.cart.addItem(this.product(), 1);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
}
