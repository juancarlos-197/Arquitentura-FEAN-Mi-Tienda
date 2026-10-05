import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Auth } from './core/services/auth';
import { Cart } from './features/cart/services/cart';
import { Loading } from './core/services/loading';
import { CartDrawer } from './features/cart/components/cart-drawer/cart-drawer';
import { User } from './shared/models';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
    CartDrawer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly auth = inject(Auth);
  readonly cart = inject(Cart);
  readonly loading = inject(Loading);
  private readonly router = inject(Router);

  readonly isSidenavOpened = signal<boolean>(true);

  toggleSidenav(): void {
    this.isSidenavOpened.update(v => !v);
  }

  switchToRole(role: 'ADMIN' | 'MANAGER' | 'CUSTOMER'): void {
    let targetUser: User;
    if (role === 'ADMIN') {
      targetUser = {
        id: 'user-admin',
        name: 'Carlos Mendoza (Admin)',
        email: 'admin@mitienda.com',
        role: 'ADMIN',
        active: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
      };
    } else if (role === 'MANAGER') {
      targetUser = {
        id: 'user-manager',
        name: 'Sofía Valenzuela (Manager)',
        email: 'manager@mitienda.com',
        role: 'MANAGER',
        active: true,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-05T09:30:00.000Z',
        updatedAt: '2026-01-05T09:30:00.000Z',
      };
    } else {
      targetUser = {
        id: 'user-customer-1',
        name: 'Javier Alban (Cliente)',
        email: 'jalban.dacompsc@gmail.com',
        role: 'CUSTOMER',
        active: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-10T14:15:00.000Z',
        updatedAt: '2026-01-10T14:15:00.000Z',
      };
    }

    this.auth.switchUser(targetUser);
  }
}
