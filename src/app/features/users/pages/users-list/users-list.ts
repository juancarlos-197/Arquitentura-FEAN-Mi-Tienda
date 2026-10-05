import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { Users } from '../../services/users';
import { Auth } from '../../../../core/services/auth';
import { User } from '../../../../shared/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { UserFormDialog } from '../../components/user-form-dialog/user-form-dialog';

@Component({
  selector: 'app-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeader,
    StatusBadge,
    EmptyState,
    LoadingSpinner,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Usuarios & Roles"
        subtitle="Control de acceso basado en roles (RBAC) gestionado con Firebase Auth y Express"
        icon="manage_accounts"
      >
        @if (auth.isAdmin()) {
          <button
            mat-flat-button
            color="primary"
            class="rounded-xl font-medium shadow-sm"
            (click)="openUserDialog()"
          >
            <mat-icon class="mr-1">person_add</mat-icon>
            Nuevo Usuario
          </button>
        }
      </app-page-header>

      <!-- RBAC Info Banner -->
      <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <mat-icon class="text-indigo-600 mt-0.5">verified_user</mat-icon>
        <div class="text-xs text-indigo-950 leading-relaxed">
          <p class="font-bold mb-1">Simulación Interactiva de Roles (FEAN Security Layer)</p>
          <p>
            Puedes hacer clic en el botón <strong class="text-indigo-700">"Simular Rol"</strong> en cualquier usuario para cambiar instantáneamente la sesión activa y verificar en tiempo real las restricciones de las capas Angular Guard, Express Middleware y Firebase Firestore.
          </p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="w-full sm:w-80">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Buscar por nombre, email o rol..."
            />
            <mat-icon matPrefix class="text-slate-400 mr-2">search</mat-icon>
            @if (searchControl.value) {
              <button mat-icon-button matSuffix (click)="searchControl.setValue('')">
                <mat-icon class="text-slate-400">close</mat-icon>
              </button>
            }
          </mat-form-field>
        </div>

        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Total: {{ filteredUsers().length }} usuarios registrados
        </span>
      </div>

      <!-- Content Area -->
      @if (usersService.loading()) {
        <app-loading-spinner message="Consultando usuarios en Firebase Auth..."></app-loading-spinner>
      } @else if (filteredUsers().length === 0) {
        <app-empty-state
          icon="group_off"
          title="Sin usuarios"
          description="No se encontraron usuarios que coincidan con el término de búsqueda."
        ></app-empty-state>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="filteredUsers()" class="w-full">
              <!-- Avatar & Name Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Usuario</th>
                <td mat-cell *matCellDef="let u" class="py-3">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.name"
                      [alt]="u.name"
                      referrerpolicy="no-referrer"
                      class="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-100"
                    />
                    <div>
                      <div class="font-bold text-slate-900 flex items-center gap-1.5">
                        {{ u.name }}
                        @if (auth.currentUser()?.id === u.id) {
                          <span class="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">TÚ</span>
                        }
                      </div>
                      <div class="text-xs text-slate-500">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Rol RBAC</th>
                <td mat-cell *matCellDef="let u">
                  <app-status-badge
                    [status]="u.role"
                    [label]="getRoleLabel(u.role)"
                  ></app-status-badge>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Estado</th>
                <td mat-cell *matCellDef="let u">
                  <app-status-badge
                    [status]="u.active ? 'ACTIVE' : 'INACTIVE'"
                    [label]="u.active ? 'Activo' : 'Suspendido'"
                  ></app-status-badge>
                </td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Contacto</th>
                <td mat-cell *matCellDef="let u" class="text-xs text-slate-600">
                  {{ u.phone || 'No registrado' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700 text-right pr-6">Acciones</th>
                <td mat-cell *matCellDef="let u" class="text-right pr-6">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Quick Role Switcher Button -->
                    <button
                      mat-stroked-button
                      class="rounded-xl text-xs font-semibold"
                      [class]="auth.currentUser()?.id === u.id ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'"
                      (click)="auth.switchUser(u)"
                    >
                      <mat-icon class="text-xs mr-1">switch_account</mat-icon>
                      {{ auth.currentUser()?.id === u.id ? 'Activo' : 'Simular' }}
                    </button>

                    @if (auth.isAdmin()) {
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="openUserDialog(u)"
                        matTooltip="Editar usuario"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>

                      <button
                        mat-icon-button
                        color="warn"
                        [disabled]="u.id === 'user-admin'"
                        (click)="confirmDelete(u)"
                        matTooltip="Eliminar usuario"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-slate-50/80 border-b border-slate-200"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"></tr>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class UsersList implements OnInit {
  readonly usersService = inject(Users);
  readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['user', 'role', 'status', 'phone', 'actions'];
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly searchTerm = signal<string>('');

  readonly filteredUsers = computed(() => {
    const list = this.usersService.users();
    const query = this.searchTerm().toLowerCase().trim();
    if (!query) return list;
    return list.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.usersService.loadUsers().subscribe();
    this.searchControl.valueChanges.subscribe(val => {
      this.searchTerm.set(val || '');
    });
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Manager';
      case 'CUSTOMER': return 'Cliente';
      default: return role;
    }
  }

  openUserDialog(user?: User): void {
    this.dialog.open(UserFormDialog, {
      width: '520px',
      data: { user },
    });
  }

  confirmDelete(user: User): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Usuario',
        message: `¿Deseas eliminar la cuenta de "${user.name}" (${user.email}) de Firebase Auth y Firestore?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.usersService.deleteUser(user.id).subscribe();
      }
    });
  }
}
