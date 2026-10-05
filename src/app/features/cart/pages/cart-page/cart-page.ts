import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Cart } from '../../services/cart';
import { Orders } from '../../../orders/services/orders';
import { Auth } from '../../../../core/services/auth';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { OrderItem } from '../../../../shared/models';

@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeader,
    EmptyState,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Carrito de Compras"
        subtitle="Gestión reactiva de pedidos con Angular Signals y persistencia FEAN"
        icon="shopping_cart"
      >
        @if (cart.items().length > 0) {
          <button
            mat-stroked-button
            color="warn"
            class="rounded-xl"
            (click)="cart.clearCart()"
          >
            <mat-icon class="mr-1">delete_sweep</mat-icon>
            Vaciar Carrito
          </button>
        }
      </app-page-header>

      @if (cart.items().length === 0) {
        <app-empty-state
          icon="shopping_cart"
          title="Tu carrito está actualmente vacío"
          description="Aún no has añadido ningún producto. Revisa nuestro catálogo y añade lo que más te guste."
        >
          <a routerLink="/products" mat-flat-button color="primary" class="rounded-xl mt-3">
            <mat-icon class="mr-1">store</mat-icon>
            Ir al Catálogo de Productos
          </a>
        </app-empty-state>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left 2 Cols: Cart Items List -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div class="p-4 border-b border-slate-100 flex items-center justify-between">
                <span class="text-sm font-bold text-slate-800">
                  Productos en tu pedido ({{ cart.totalItems() }} unidades)
                </span>
                <span class="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
                  Signals State Active
                </span>
              </div>

              <div class="divide-y divide-slate-100">
                @for (item of cart.items(); track item.product.id) {
                  <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div class="flex items-center gap-4">
                      <img
                        [src]="item.product.imageUrl"
                        [alt]="item.product.name"
                        referrerpolicy="no-referrer"
                        class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <a [routerLink]="['/products', item.product.id]" class="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                          {{ item.product.name }}
                        </a>
                        <p class="text-xs text-slate-500 mt-0.5">{{ item.product.categoryName || 'General' }}</p>
                        <p class="text-xs font-semibold text-slate-700 mt-1">
                          {{ item.product.price | currencyFormat }} / unidad
                        </p>
                      </div>
                    </div>

                    <!-- Quantity Stepper & Price -->
                    <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <!-- Stepper -->
                      <div class="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                        <button
                          type="button"
                          class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                          (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                        >
                          <mat-icon class="text-xs">remove</mat-icon>
                        </button>
                        <span class="px-3 text-sm font-bold text-slate-800">{{ item.quantity }}</span>
                        <button
                          type="button"
                          class="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"
                          [disabled]="item.quantity >= item.product.stock"
                          (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                        >
                          <mat-icon class="text-xs">add</mat-icon>
                        </button>
                      </div>

                      <!-- Subtotal for line item -->
                      <div class="text-right min-w-[90px]">
                        <span class="font-extrabold text-base text-slate-900 block">
                          {{ (item.product.price * item.quantity) | currencyFormat }}
                        </span>
                      </div>

                      <!-- Remove Button -->
                      <button
                        type="button"
                        mat-icon-button
                        color="warn"
                        (click)="cart.removeItem(item.product.id)"
                        matTooltip="Eliminar del carrito"
                      >
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Promo Code Box -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <div class="flex-1 w-full">
                  <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                    <input
                      matInput
                      [formControl]="promoControl"
                      placeholder="Código de cupón (Ej. FEAN2026 o FIREBASE20)"
                    />
                    <mat-icon matPrefix class="text-slate-400 mr-2">local_offer</mat-icon>
                  </mat-form-field>
                </div>
                <button
                  type="button"
                  mat-flat-button
                  color="accent"
                  class="rounded-xl px-5 h-12 w-full sm:w-auto font-semibold"
                  (click)="applyCoupon()"
                >
                  Aplicar Cupón
                </button>
              </div>
              <p class="text-xs text-slate-400 mt-2">
                Tip: Prueba con el código <span class="font-mono font-bold text-indigo-600">FEAN2026</span> (10% desc.) o <span class="font-mono font-bold text-indigo-600">FIREBASE20</span> (20% desc.)
              </p>
            </div>
          </div>

          <!-- Right Col: Checkout & Summary Form -->
          <div class="space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <h3 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Resumen del Pedido
              </h3>

              <!-- Totals Breakdown -->
              <div class="space-y-2.5 text-sm">
                <div class="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span class="font-semibold">{{ cart.subtotal() | currencyFormat }}</span>
                </div>

                @if (cart.discountAmount() > 0) {
                  <div class="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento Promocional ({{ cart.discountPercent() }}%)</span>
                    <span>-{{ cart.discountAmount() | currencyFormat }}</span>
                  </div>
                }

                <div class="flex justify-between text-slate-600">
                  <span>Gastos de Envío</span>
                  <span class="font-semibold">
                    @if (cart.shipping() === 0) {
                      <span class="text-emerald-600 uppercase text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">¡Gratis!</span>
                    } @else {
                      {{ cart.shipping() | currencyFormat }}
                    }
                  </span>
                </div>

                @if (cart.subtotal() < 100) {
                  <p class="text-[11px] text-amber-600 font-medium">
                    Agrega {{ (100 - cart.subtotal()) | currencyFormat }} más para envío gratuito.
                  </p>
                }

                <div class="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span class="text-base font-bold text-slate-900">Total a Pagar</span>
                  <span class="text-2xl font-black text-slate-900 tracking-tight text-indigo-600">
                    {{ cart.total() | currencyFormat }}
                  </span>
                </div>
              </div>

              <!-- Checkout Details Form -->
              <form [formGroup]="checkoutForm" (ngSubmit)="processOrder()" class="space-y-4 pt-4 border-t border-slate-100">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Datos de Envío & Pago</h4>

                <div>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Dirección de Entrega *</mat-label>
                    <input matInput formControlName="shippingAddress" placeholder="Calle, Número, Ciudad, Código Postal" />
                    <mat-icon matPrefix class="text-slate-400 mr-2">place</mat-icon>
                    @if (checkoutForm.controls.shippingAddress.invalid && checkoutForm.controls.shippingAddress.touched) {
                      <mat-error>La dirección de entrega es obligatoria</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Método de Pago *</mat-label>
                    <mat-select formControlName="paymentMethod">
                      <mat-option value="Tarjeta de Crédito / Débito (Stripe & Firebase)">
                        💳 Tarjeta de Crédito / Débito
                      </mat-option>
                      <mat-option value="Google Pay">
                        📱 Google Pay
                      </mat-option>
                      <mat-option value="Transferencia Bancaria">
                        🏦 Transferencia Bancaria
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Instrucciones de entrega</mat-label>
                    <input matInput formControlName="notes" placeholder="Ej. Dejar en conserjería..." />
                    <mat-icon matPrefix class="text-slate-400 mr-2">notes</mat-icon>
                  </mat-form-field>
                </div>

                <button
                  type="submit"
                  mat-flat-button
                  color="primary"
                  [disabled]="checkoutForm.invalid || isProcessing()"
                  class="w-full py-3.5 rounded-xl font-bold text-base shadow-md shadow-indigo-600/20"
                >
                  @if (isProcessing()) {
                    <span class="flex items-center justify-center gap-2">
                      <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                      Enviando orden a Express & Firestore...
                    </span>
                  } @else {
                    <span class="flex items-center justify-center gap-2">
                      <mat-icon class="text-sm">check_circle</mat-icon>
                      Confirmar y Pagar ({{ cart.total() | currencyFormat }})
                    </span>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartPage {
  readonly cart = inject(Cart);
  private readonly ordersService = inject(Orders);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly isProcessing = signal<boolean>(false);
  readonly promoControl = new FormControl<string>('', { nonNullable: true });

  readonly checkoutForm = new FormGroup({
    shippingAddress: new FormControl<string>('Paseo de la Castellana 200, 28046 Madrid, España', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    paymentMethod: new FormControl<string>('Tarjeta de Crédito / Débito (Stripe & Firebase)', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl<string>('', { nonNullable: true }),
  });

  applyCoupon(): void {
    if (this.promoControl.value) {
      this.cart.applyPromoCode(this.promoControl.value);
    }
  }

  processOrder(): void {
    if (this.checkoutForm.invalid || this.cart.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);
    const user = this.auth.currentUser();
    const { shippingAddress, paymentMethod, notes } = this.checkoutForm.getRawValue();

    const orderItems: OrderItem[] = this.cart.items().map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      productPrice: i.product.price,
      quantity: i.quantity,
      subtotal: Math.round(i.product.price * i.quantity * 100) / 100,
      imageUrl: i.product.imageUrl,
    }));

    const orderPayload = {
      customerId: user ? user.id : 'user-guest',
      customerName: user ? user.name : 'Cliente Invitado',
      customerEmail: user ? user.email : 'cliente@mitienda.com',
      items: orderItems,
      shippingAddress,
      paymentMethod,
      notes,
    };

    this.ordersService.createOrder(orderPayload).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.cart.clearCart();
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.isProcessing.set(false);
      },
    });
  }
}
