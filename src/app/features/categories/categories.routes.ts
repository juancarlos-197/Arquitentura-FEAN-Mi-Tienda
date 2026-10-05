import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categories-list/categories-list').then(m => m.CategoriesList),
    title: 'Categorías | Mi Tienda FEAN',
  },
];
