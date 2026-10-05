import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardPage),
    title: 'Dashboard Empresarial | Mi Tienda FEAN',
  },
];
