import { Routes } from '@angular/router';

export const CART_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cart-page/cart-page').then(m => m.CartPage),
    title: 'Carrito de Compras | Mi Tienda FEAN',
  },
];
