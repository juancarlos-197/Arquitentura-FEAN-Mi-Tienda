import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/users-list/users-list').then(m => m.UsersList),
    title: 'Gestión de Usuarios | Mi Tienda FEAN',
  },
];
