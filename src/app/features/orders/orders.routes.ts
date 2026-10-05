import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/orders-list/orders-list').then(m => m.OrdersList),
    title: 'Pedidos | Mi Tienda FEAN',
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/order-detail/order-detail').then(m => m.OrderDetail),
    title: 'Detalle de Pedido | Mi Tienda FEAN',
  },
];
