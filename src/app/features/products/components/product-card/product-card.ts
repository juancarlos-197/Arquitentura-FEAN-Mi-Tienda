import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
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
    CurrencyFormatPipe,
  ],
  template: `
    <div class="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      <!-- Top Image Container -->
      <a [routerLink]="['/products', product().id]" class="block relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          (error)="onImageError($event)"
        />

        <!-- Category Badge -->
        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs border border-white/40">
          {{ product().categoryName || 'General' }}
        </span>

        <!-- Stock Status Badge -->
        <span
          class="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs"
          [class]="stockBadgeClass()"
        >
          {{ stockBadgeText() }}
        </span>
      </a>

      <!-- Card Body -->
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <!-- Rating -->
          <div class="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
            <mat-icon class="text-sm">star</mat-icon>
            <span class="font-bold text-slate-700">{{ product().rating || 4.8 }}</span>
            <span class="text-slate-400">({{ product().reviewsCount || 42 }})</span>
          </div>

          <!-- Product Title -->
          <a [routerLink]="['/products', product().id]" class="hover:text-indigo-600 transition-colors">
            <h3 class="font-bold text-base text-slate-900 line-clamp-1 mb-1">
              {{ product().name }}
            </h3>
          </a>

          <!-- Description -->
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {{ product().description }}
          </p>
        </div>

        <!-- Footer / Price & Action -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span class="text-[11px] text-slate-400 block font-medium">Precio</span>
            <span class="text-lg font-black text-slate-900 tracking-tight">
              {{ product().price | currencyFormat }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            @if (auth.isAdmin() || auth.isManager()) {
              <button
                type="button"
                mat-icon-button
                class="text-slate-400 hover:text-indigo-600"
                (click)="editClicked.emit(product())"
                matTooltip="Editar producto"
              >
                <mat-icon class="text-lg">edit</mat-icon>
              </button>
            }

            <button
              type="button"
              mat-flat-button
              color="primary"
              [disabled]="product().stock <= 0"
              (click)="onAddToCart($event)"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs"
            >
              <mat-icon class="text-sm mr-1">shopping_cart</mat-icon>
              Añadir
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
    if (s <= 0) return 'bg-rose-500 text-white';
    if (s < 5) return 'bg-amber-500 text-white animate-pulse';
    return 'bg-emerald-600/90 text-white';
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
