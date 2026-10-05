import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/products-list/products-list').then(m => m.ProductsList),
    title: 'Catálogo de Productos | Mi Tienda FEAN',
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail),
    title: 'Detalle de Producto | Mi Tienda FEAN',
  },
];
