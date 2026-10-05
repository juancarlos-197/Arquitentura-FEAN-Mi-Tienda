import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { Categories } from '../../services/categories';
import { Category } from '../../../../shared/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { CategoryFormDialog } from '../../components/category-form-dialog/category-form-dialog';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-categories-list',
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
        title="Categorías"
        subtitle="Administración de taxonomía y agrupación de catálogo"
        icon="category"
      >
        @if (auth.isAdmin() || auth.isManager()) {
          <button
            mat-flat-button
            color="primary"
            class="rounded-xl font-medium shadow-sm"
            (click)="openCategoryDialog()"
          >
            <mat-icon class="mr-1">add</mat-icon>
            Nueva Categoría
          </button>
        }
      </app-page-header>

      <!-- Filter Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="w-full sm:w-80">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Buscar categoría..."
            />
            <mat-icon matPrefix class="text-slate-400 mr-2">search</mat-icon>
            @if (searchControl.value) {
              <button mat-icon-button matSuffix (click)="searchControl.setValue('')">
                <mat-icon class="text-slate-400">close</mat-icon>
              </button>
            }
          </mat-form-field>
        </div>

        <div class="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider self-end sm:self-auto">
          <span>Total: {{ filteredCategories().length }} categorías</span>
        </div>
      </div>

      <!-- Content Area -->
      @if (categoriesService.loading()) {
        <app-loading-spinner message="Consultando categorías en Firestore..."></app-loading-spinner>
      } @else if (filteredCategories().length === 0) {
        <app-empty-state
          icon="category"
          title="Sin categorías"
          description="No se han encontrado categorías que coincidan con la búsqueda."
        >
          @if (auth.isAdmin() || auth.isManager()) {
            <button
              mat-stroked-button
              color="primary"
              class="rounded-xl mt-3"
              (click)="openCategoryDialog()"
            >
              <mat-icon class="mr-1">add</mat-icon>
              Crear la primera categoría
            </button>
          }
        </app-empty-state>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="filteredCategories()" class="w-full">
              <!-- Icon Column -->
              <ng-container matColumnDef="icon">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700 w-16">Icono</th>
                <td mat-cell *matCellDef="let cat" class="py-4">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <mat-icon>{{ cat.icon || 'category' }}</mat-icon>
                  </div>
                </td>
              </ng-container>

              <!-- Name & Description Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Categoría</th>
                <td mat-cell *matCellDef="let cat" class="py-4">
                  <div class="font-semibold text-slate-900">{{ cat.name }}</div>
                  <div class="text-xs text-slate-500 max-w-md line-clamp-1 mt-0.5">
                    {{ cat.description || 'Sin descripción adicional' }}
                  </div>
                </td>
              </ng-container>

              <!-- Products Count Column -->
              <ng-container matColumnDef="productCount">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Productos</th>
                <td mat-cell *matCellDef="let cat">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    <mat-icon class="text-xs">inventory_2</mat-icon>
                    {{ cat.productCount || 0 }} productos
                  </span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Estado</th>
                <td mat-cell *matCellDef="let cat">
                  <app-status-badge
                    [status]="cat.active ? 'ACTIVE' : 'INACTIVE'"
                    [label]="cat.active ? 'Activa' : 'Inactiva'"
                  ></app-status-badge>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700 text-right pr-6">Acciones</th>
                <td mat-cell *matCellDef="let cat" class="text-right pr-6">
                  @if (auth.isAdmin() || auth.isManager()) {
                    <div class="flex items-center justify-end gap-1">
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="openCategoryDialog(cat)"
                        matTooltip="Editar"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      @if (auth.isAdmin()) {
                        <button
                          mat-icon-button
                          color="warn"
                          (click)="confirmDelete(cat)"
                          matTooltip="Eliminar"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </div>
                  } @else {
                    <span class="text-xs text-slate-400">Solo lectura</span>
                  }
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
export class CategoriesList implements OnInit {
  readonly categoriesService = inject(Categories);
  readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['icon', 'name', 'productCount', 'status', 'actions'];
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly searchTerm = signal<string>('');

  readonly filteredCategories = computed(() => {
    const list = this.categoriesService.categories();
    const query = this.searchTerm().toLowerCase().trim();
    if (!query) return list;
    return list.filter(c =>
      c.name.toLowerCase().includes(query) || (c.description && c.description.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.categoriesService.loadCategories().subscribe();
    this.searchControl.valueChanges.subscribe(val => {
      this.searchTerm.set(val || '');
    });
  }

  openCategoryDialog(category?: Category): void {
    this.dialog.open(CategoryFormDialog, {
      width: '520px',
      data: { category },
    });
  }

  confirmDelete(category: Category): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Categoría',
        message: `¿Estás seguro de que deseas eliminar la categoría "${category.name}" de la base de datos de Firebase Firestore?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.categoriesService.deleteCategory(category.id).subscribe();
      }
    });
  }
}
