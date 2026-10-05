import { computed, inject, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';

const STORAGE_KEY_CART = 'fean_shopping_cart';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private readonly notification = inject(Notification);

  private readonly _items = signal<CartItem[]>(this.loadCartFromStorage());
  private readonly _discountPercent = signal<number>(0);
  private readonly _promoCode = signal<string>('');
  readonly isDrawerOpen = signal<boolean>(false);

  readonly items = this._items.asReadonly();
  readonly discountPercent = this._discountPercent.asReadonly();
  readonly promoCode = this._promoCode.asReadonly();

  readonly totalItems = computed(() => {
    return this._items().reduce((acc, item) => acc + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    return this._items().reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  });

  readonly shipping = computed(() => {
    // Free shipping over 100€
    const sub = this.subtotal();
    return sub > 100 || sub === 0 ? 0 : 5.90;
  });

  readonly discountAmount = computed(() => {
    return (this.subtotal() * this._discountPercent()) / 100;
  });

  readonly total = computed(() => {
    const rawTotal = this.subtotal() - this.discountAmount() + this.shipping();
    return Math.max(0, Math.round(rawTotal * 100) / 100);
  });

  private loadCartFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveCartToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(this._items()));
    } catch (e) {
      console.warn('Could not persist cart:', e);
    }
  }

  addItem(product: Product, quantity = 1): void {
    if (product.stock <= 0) {
      this.notification.error('Este producto está agotado');
      return;
    }

    this._items.update(currentItems => {
      const existingIndex = currentItems.findIndex(i => i.product.id === product.id);
      if (existingIndex > -1) {
        const item = currentItems[existingIndex];
        const newQty = Math.min(item.quantity + quantity, product.stock);
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
        };
        return updated;
      } else {
        return [...currentItems, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });

    this.saveCartToStorage();
    this.notification.success(`"${product.name}" añadido al carrito`);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this._items.update(currentItems => {
      return currentItems.map(item => {
        if (item.product.id === productId) {
          const validQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      });
    });

    this.saveCartToStorage();
  }

  removeItem(productId: string): void {
    const removedItem = this._items().find(i => i.product.id === productId);
    this._items.update(items => items.filter(i => i.product.id !== productId));
    this.saveCartToStorage();
    if (removedItem) {
      this.notification.info(`"${removedItem.product.name}" eliminado del carrito`);
    }
  }

  clearCart(): void {
    this._items.set([]);
    this._discountPercent.set(0);
    this._promoCode.set('');
    this.saveCartToStorage();
  }

  applyPromoCode(code: string): boolean {
    const clean = code.trim().toUpperCase();
    if (clean === 'FEAN2026' || clean === 'DESCUENTO10') {
      this._discountPercent.set(10);
      this._promoCode.set(clean);
      this.notification.success('Cupón del 10% aplicado correctamente');
      return true;
    } else if (clean === 'FIREBASE20') {
      this._discountPercent.set(20);
      this._promoCode.set(clean);
      this.notification.success('¡Cupón VIP del 20% aplicado!');
      return true;
    } else {
      this.notification.error('Cupón promocional no válido');
      return false;
    }
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update(v => !v);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }
}
