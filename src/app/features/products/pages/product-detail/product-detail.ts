import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Products } from '../../services/products';
import { Cart } from '../../../cart/services/cart';
import { Auth } from '../../../../core/services/auth';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { ProductFormDialog } from '../../components/product-form-dialog/product-form-dialog';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinner,
    EmptyState,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Back breadcrumb -->
      <div class="flex items-center justify-between">
        <a routerLink="/products" class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <mat-icon class="text-sm">arrow_back</mat-icon>
          Volver al Catálogo
        </a>

        @if (product() && (auth.isAdmin() || auth.isManager())) {
          <button
            mat-stroked-button
            color="primary"
            class="rounded-xl"
            (click)="editProduct()"
          >
            <mat-icon class="mr-1">edit</mat-icon>
            Editar Producto
          </button>
        }
      </div>

      @if (productsService.loading()) {
        <app-loading-spinner message="Consultando detalles en Firebase..."></app-loading-spinner>
      } @else if (!product()) {
        <app-empty-state
          icon="inventory_2"
          title="Producto no disponible"
          description="El producto solicitado no existe o ha sido retirado del catálogo."
        >
          <a routerLink="/products" mat-flat-button color="primary" class="rounded-xl mt-3">
            Explorar catálogo
          </a>
        </app-empty-state>
      } @else {
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Left: Product Image Showcase -->
            <div class="space-y-4">
              <div class="aspect-4/3 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                <img
                  [src]="product()?.imageUrl"
                  [alt]="product()?.name"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-cover object-center"
                />
              </div>

              <!-- Badges & Highlights -->
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <mat-icon class="text-xs">verified</mat-icon>
                  Garantía Oficial 3 Años
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <mat-icon class="text-xs">local_shipping</mat-icon>
                  Envío Express 24/48h
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <mat-icon class="text-xs">lock</mat-icon>
                  Pago Seguro Firebase
                </span>
              </div>
            </div>

            <!-- Right: Details, Price & Add to Cart -->
            <div class="flex flex-col justify-between space-y-6">
              <div>
                <!-- Category & Stock Status -->
                <div class="flex items-center justify-between gap-3 mb-2">
                  <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {{ product()?.categoryName || 'General' }}
                  </span>

                  <span
                    class="text-xs font-bold px-2.5 py-1 rounded-full"
                    [class]="product()!.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                  >
                    {{ product()!.stock > 0 ? 'En Stock (' + product()!.stock + ' disponibles)' : 'Agotado' }}
                  </span>
                </div>

                <!-- Title -->
                <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                  {{ product()?.name }}
                </h1>

                <!-- Rating -->
                <div class="flex items-center gap-2 mb-6">
                  <div class="flex items-center text-amber-500">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <mat-icon class="text-lg">star</mat-icon>
                    }
                  </div>
                  <span class="text-sm font-bold text-slate-800">{{ product()?.rating || 4.9 }}</span>
                  <span class="text-sm text-slate-400">· {{ product()?.reviewsCount || 85 }} valoraciones verificadas</span>
                </div>

                <!-- Price Box -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 mb-6">
                  <div class="text-xs text-slate-500 font-medium">Precio final (IVA incluido)</div>
                  <div class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                    {{ product()?.price | currencyFormat }}
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">Descripción del Producto</h3>
                  <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {{ product()?.description }}
                  </p>
                </div>
              </div>

              <!-- Purchase Selector -->
              <div class="pt-6 border-t border-slate-100 space-y-4">
                <div class="flex items-center gap-4">
                  <!-- Quantity Stepper -->
                  <div class="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      [disabled]="quantity() <= 1"
                      (click)="decreaseQuantity()"
                      class="px-3 py-2 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-30"
                    >
                      <mat-icon class="text-sm">remove</mat-icon>
                    </button>
                    <span class="px-4 text-sm font-bold text-slate-800">{{ quantity() }}</span>
                    <button
                      type="button"
                      [disabled]="quantity() >= product()!.stock"
                      (click)="increaseQuantity()"
                      class="px-3 py-2 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-30"
                    >
                      <mat-icon class="text-sm">add</mat-icon>
                    </button>
                  </div>

                  <!-- Add to Cart Button -->
                  <button
                    type="button"
                    mat-flat-button
                    color="primary"
                    [disabled]="product()!.stock <= 0"
                    (click)="addToCart()"
                    class="flex-1 py-3 rounded-xl font-bold text-base shadow-md shadow-indigo-600/20"
                  >
                    <mat-icon class="mr-2">shopping_bag</mat-icon>
                    Añadir al Carrito ({{ (product()!.price * quantity()) | currencyFormat }})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly productsService = inject(Products);
  readonly cart = inject(Cart);
  readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);

  readonly quantity = signal<number>(1);
  readonly product = this.productsService.selectedProduct;

  decreaseQuantity(): void {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  increaseQuantity(): void {
    const stock = this.product()?.stock ?? 1;
    this.quantity.update(q => Math.min(stock, q + 1));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productsService.getProductById(id).subscribe();
    }
  }

  addToCart(): void {
    const current = this.product();
    if (current) {
      this.cart.addItem(current, this.quantity());
    }
  }

  editProduct(): void {
    const current = this.product();
    if (current) {
      const ref = this.dialog.open(ProductFormDialog, {
        width: '640px',
        data: { product: current },
      });
      ref.afterClosed().subscribe(updated => {
        if (updated) {
          this.productsService.getProductById(current.id).subscribe();
        }
      });
    }
  }
}
