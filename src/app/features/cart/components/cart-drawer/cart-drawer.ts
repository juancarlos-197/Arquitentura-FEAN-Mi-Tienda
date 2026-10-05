import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Cart } from '../../services/cart';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    CurrencyFormatPipe,
  ],
  template: `
    @if (cart.isDrawerOpen()) {
      <!-- Backdrop -->
      <button
        type="button"
        aria-label="Cerrar carrito"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity w-full h-full border-0 cursor-default"
        (click)="cart.closeDrawer()"
      ></button>

      <!-- Drawer Panel -->
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          <!-- Drawer Header -->
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-indigo-600">shopping_bag</mat-icon>
              <h2 class="text-lg font-bold text-slate-900">Tu Carrito ({{ cart.totalItems() }})</h2>
            </div>
            <button mat-icon-button (click)="cart.closeDrawer()">
              <mat-icon class="text-slate-400">close</mat-icon>
            </button>
          </div>

          <!-- Drawer Body: Items -->
          <div class="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
            @if (cart.items().length === 0) {
              <div class="text-center py-16">
                <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <mat-icon class="text-3xl">remove_shopping_cart</mat-icon>
                </div>
                <p class="font-bold text-slate-700">Tu carrito está vacío</p>
                <p class="text-xs text-slate-500 mt-1">Descubre productos increíbles en nuestro catálogo</p>
                <button
                  mat-flat-button
                  color="primary"
                  class="rounded-xl mt-4"
                  (click)="cart.closeDrawer()"
                  routerLink="/products"
                >
                  Ver Catálogo
                </button>
              </div>
            } @else {
              @for (item of cart.items(); track item.product.id) {
                <div class="py-4 flex gap-4">
                  <img
                    [src]="item.product.imageUrl"
                    [alt]="item.product.name"
                    referrerpolicy="no-referrer"
                    class="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm text-slate-900 truncate">{{ item.product.name }}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">{{ item.product.price | currencyFormat }}</p>

                    <!-- Quantity controls -->
                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          class="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                          (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                        >
                          -
                        </button>
                        <span class="px-2 text-xs font-bold">{{ item.quantity }}</span>
                        <button
                          type="button"
                          class="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                          (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                        >
                          +
                        </button>
                      </div>

                      <span class="font-bold text-sm text-slate-900">
                        {{ (item.product.price * item.quantity) | currencyFormat }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Drawer Footer -->
          @if (cart.items().length > 0) {
            <div class="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{{ cart.subtotal() | currencyFormat }}</span>
                </div>
                @if (cart.discountAmount() > 0) {
                  <div class="flex justify-between text-emerald-600 font-medium">
                    <span>Descuento ({{ cart.discountPercent() }}%)</span>
                    <span>-{{ cart.discountAmount() | currencyFormat }}</span>
                  </div>
                }
                <div class="flex justify-between text-slate-500">
                  <span>Envío</span>
                  <span>{{ cart.shipping() === 0 ? 'Gratis' : (cart.shipping() | currencyFormat) }}</span>
                </div>
                <div class="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{{ cart.total() | currencyFormat }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <a
                  routerLink="/cart"
                  (click)="cart.closeDrawer()"
                  mat-stroked-button
                  class="rounded-xl font-medium"
                >
                  Ver Carrito
                </a>
                <a
                  routerLink="/cart"
                  (click)="cart.closeDrawer()"
                  mat-flat-button
                  color="primary"
                  class="rounded-xl font-medium shadow-xs"
                >
                  Checkout
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class CartDrawer {
  readonly cart = inject(Cart);
}
