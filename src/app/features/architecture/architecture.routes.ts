import { Routes } from '@angular/router';

export const ARCHITECTURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/architecture-viewer/architecture-viewer').then(m => m.ArchitectureViewer),
    title: 'Arquitectura FEAN | Mi Tienda',
  },
];
