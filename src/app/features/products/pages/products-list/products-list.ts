import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Products } from '../../services/products';
import { Categories } from '../../../categories/services/categories';
import { Auth } from '../../../../core/services/auth';
import { Cart } from '../../../cart/services/cart';
import { Product } from '../../../../shared/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductFormDialog } from '../../components/product-form-dialog/product-form-dialog';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-products-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTableModule,
    PageHeader,
    ProductCard,
    LoadingSpinner,
    EmptyState,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <app-page-header
        title="Catálogo de Productos"
        subtitle="Artículos sincronizados en tiempo real mediante Express REST y Firebase"
        icon="store"
      >
        @if (auth.isAdmin() || auth.isManager()) {
          <button
            mat-flat-button
            color="primary"
            class="rounded-xl font-medium shadow-sm"
            (click)="openProductDialog()"
          >
            <mat-icon class="mr-1">add</mat-icon>
            Nuevo Producto
          </button>
        }
      </app-page-header>

      <!-- Category Filter Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          (click)="selectCategory('all')"
          class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs border"
          [class]="selectedCategory() === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'"
        >
          <mat-icon class="text-sm">apps</mat-icon>
          Todos ({{ totalCount() }})
        </button>

        @for (cat of categoriesService.categories(); track cat.id) {
          <button
            type="button"
            (click)="selectCategory(cat.id)"
            class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs border"
            [class]="selectedCategory() === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'"
          >
            <mat-icon class="text-sm">{{ cat.icon || 'category' }}</mat-icon>
            {{ cat.name }} ({{ cat.productCount || 0 }})
          </button>
        }
      </div>

      <!-- Search & Controls Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <input
                matInput
                [formControl]="searchControl"
                placeholder="Buscar por nombre, modelo o descripción..."
              />
              <mat-icon matPrefix class="text-slate-400 mr-2">search</mat-icon>
              @if (searchControl.value) {
                <button mat-icon-button matSuffix (click)="searchControl.setValue('')">
                  <mat-icon class="text-slate-400">close</mat-icon>
                </button>
              }
            </mat-form-field>
          </div>

          <!-- Sort & View Controls -->
          <div class="flex items-center gap-3 self-end md:self-auto flex-wrap">
            <!-- Sort dropdown -->
            <div class="w-48">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-select [formControl]="sortControl">
                  <mat-option value="newest">Más recientes</mat-option>
                  <mat-option value="price_asc">Precio: Menor a Mayor</mat-option>
                  <mat-option value="price_desc">Precio: Mayor a Menor</mat-option>
                  <mat-option value="rating">Mejor valorados</mat-option>
                  <mat-option value="name_asc">Nombre (A-Z)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- View toggle (Grid vs Table) -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                (click)="viewMode.set('grid')"
                class="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
                [class.bg-white]="viewMode() === 'grid'"
                [class.shadow-2xs]="viewMode() === 'grid'"
                matTooltip="Vista en cuadrícula"
              >
                <mat-icon class="text-base">grid_view</mat-icon>
              </button>
              <button
                type="button"
                (click)="viewMode.set('table')"
                class="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
                [class.bg-white]="viewMode() === 'table'"
                [class.shadow-2xs]="viewMode() === 'table'"
                matTooltip="Vista en lista"
              >
                <mat-icon class="text-base">table_rows</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Products View Area -->
      @if (productsService.loading()) {
        <app-loading-spinner message="Cargando productos de Firebase Firestore..."></app-loading-spinner>
      } @else if (filteredProducts().length === 0) {
        <app-empty-state
          icon="search_off"
          title="No se encontraron productos"
          description="Intenta modificar los filtros de búsqueda o la categoría seleccionada."
        >
          <button
            mat-stroked-button
            color="primary"
            class="rounded-xl mt-3"
            (click)="resetFilters()"
          >
            Limpiar filtros
          </button>
        </app-empty-state>
      } @else {
        <!-- Grid View -->
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (product of filteredProducts(); track product.id) {
              <app-product-card
                [product]="product"
                (editClicked)="openProductDialog($event)"
              ></app-product-card>
            }
          </div>
        } @else {
          <!-- Table View -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="filteredProducts()" class="w-full">
                <!-- Image Column -->
                <ng-container matColumnDef="image">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700 w-16">Imagen</th>
                  <td mat-cell *matCellDef="let p" class="py-3">
                    <img
                      [src]="p.imageUrl"
                      [alt]="p.name"
                      referrerpolicy="no-referrer"
                      class="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  </td>
                </ng-container>

                <!-- Name & Category Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Producto</th>
                  <td mat-cell *matCellDef="let p" class="py-3">
                    <a [routerLink]="['/products', p.id]" class="font-bold text-slate-900 hover:text-indigo-600 transition-colors block">
                      {{ p.name }}
                    </a>
                    <span class="text-xs text-indigo-600 font-medium">{{ p.categoryName || 'General' }}</span>
                  </td>
                </ng-container>

                <!-- Price Column -->
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Precio</th>
                  <td mat-cell *matCellDef="let p" class="font-bold text-slate-900">
                    {{ p.price | currencyFormat }}
                  </td>
                </ng-container>

                <!-- Stock Column -->
                <ng-container matColumnDef="stock">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700">Stock</th>
                  <td mat-cell *matCellDef="let p">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-semibold"
                      [class]="p.stock > 0 ? (p.stock < 5 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200') : 'bg-rose-50 text-rose-700 border border-rose-200'"
                    >
                      {{ p.stock > 0 ? p.stock + ' unidades' : 'Agotado' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold text-slate-700 text-right pr-6">Acciones</th>
                  <td mat-cell *matCellDef="let p" class="text-right pr-6">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        mat-stroked-button
                        color="primary"
                        class="rounded-xl text-xs"
                        [disabled]="p.stock <= 0"
                        (click)="cart.addItem(p, 1)"
                      >
                        <mat-icon class="text-xs mr-1">shopping_cart</mat-icon>
                        Añadir
                      </button>

                      @if (auth.isAdmin() || auth.isManager()) {
                        <button
                          mat-icon-button
                          color="primary"
                          (click)="openProductDialog(p)"
                          matTooltip="Editar"
                        >
                          <mat-icon>edit</mat-icon>
                        </button>
                        @if (auth.isAdmin()) {
                          <button
                            mat-icon-button
                            color="warn"
                            (click)="confirmDelete(p)"
                            matTooltip="Eliminar"
                          >
                            <mat-icon>delete</mat-icon>
                          </button>
                        }
                      }
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="tableColumns" class="bg-slate-50/80 border-b border-slate-200"></tr>
                <tr mat-row *matRowDef="let row; columns: tableColumns;" class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"></tr>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ProductsList implements OnInit {
  readonly productsService = inject(Products);
  readonly categoriesService = inject(Categories);
  readonly auth = inject(Auth);
  readonly cart = inject(Cart);
  private readonly dialog = inject(MatDialog);

  readonly viewMode = signal<'grid' | 'table'>('grid');
  readonly selectedCategory = signal<string>('all');
  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly sortControl = new FormControl<string>('newest', { nonNullable: true });

  readonly tableColumns = ['image', 'name', 'price', 'stock', 'actions'];

  readonly totalCount = computed(() => this.productsService.products().length);

  readonly filteredProducts = computed(() => {
    let list = this.productsService.products();
    const cat = this.selectedCategory();
    const query = this.searchControl.value.toLowerCase().trim();
    const sort = this.sortControl.value;

    if (cat !== 'all') {
      list = list.filter(p => p.categoryId === cat);
    }

    if (query) {
      list = list.filter(
        p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    const sorted = [...list];
    switch (sort) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return sorted;
  });

  ngOnInit(): void {
    this.productsService.loadProducts().subscribe();
    this.categoriesService.loadCategories().subscribe();
  }

  selectCategory(catId: string): void {
    this.selectedCategory.set(catId);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchControl.setValue('');
    this.sortControl.setValue('newest');
  }

  openProductDialog(product?: Product): void {
    this.dialog.open(ProductFormDialog, {
      width: '640px',
      data: { product },
    });
  }

  confirmDelete(product: Product): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Eliminar Producto',
        message: `¿Deseas eliminar permanentemente "${product.name}" de la tienda y de Firebase Firestore?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productsService.deleteProduct(product.id).subscribe();
      }
    });
  }
}
