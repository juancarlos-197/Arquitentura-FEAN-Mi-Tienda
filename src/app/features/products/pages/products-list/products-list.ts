import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { Firebase } from '../../../../core/services/firebase';

@Component({
  selector: 'app-products-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
        <div class="flex items-center gap-2">
          <button
            type="button"
            mat-stroked-button
            class="rounded-xl font-medium text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer"
            (click)="seedFirestoreProducts()"
            [disabled]="isSeedingFirestore()"
            matTooltip="Inicializa la colección 'products' en Cloud Firestore"
          >
            <mat-icon class="mr-1 text-amber-600">local_fire_department</mat-icon>
            {{ isSeedingFirestore() ? 'Sincronizando...' : 'Iniciar Colección Firestore' }}
          </button>

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
        </div>
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
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <!-- Real-Time Signals Search Input -->
          <div class="flex-1 max-w-lg">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Filtrar por nombre o categoría en tiempo real...</mat-label>
              <input
                matInput
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
                placeholder="Ej. Audífonos, Tecnología, Café, Hogar..."
              />
              <mat-icon matPrefix class="text-indigo-600 mr-2">search</mat-icon>
              @if (searchTerm()) {
                <button
                  type="button"
                  mat-icon-button
                  matSuffix
                  (click)="clearSearch()"
                  aria-label="Limpiar filtro"
                >
                  <mat-icon class="text-slate-400 hover:text-slate-600">close</mat-icon>
                </button>
              }
            </mat-form-field>
          </div>

          <!-- Sort & View Controls -->
          <div class="flex items-center gap-3 self-end md:self-auto flex-wrap">
            <!-- Sort dropdown -->
            <div class="w-48">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Ordenar por</mat-label>
                <mat-select [value]="sortBy()" (selectionChange)="onSortChange($event.value)">
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

        <!-- Real-Time Metrics & Reset Action -->
        <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Mostrando <strong class="text-indigo-600 font-bold">{{ filteredProducts().length }}</strong> de {{ totalCount() }} productos
            @if (searchTerm()) {
              <span> (coincidencia con "<strong>{{ searchTerm() }}</strong>")</span>
            }
          </span>
          @if (searchTerm() || selectedCategory() !== 'all') {
            <button
              type="button"
              (click)="resetFilters()"
              class="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <mat-icon class="text-xs">restart_alt</mat-icon>
              Limpiar filtros
            </button>
          }
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
                (editClicked)="openProductDialog($any($event))"
                (deleteClicked)="confirmDelete($any($event))"
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
  readonly firebase = inject(Firebase);
  private readonly dialog = inject(MatDialog);

  readonly viewMode = signal<'grid' | 'table'>('grid');
  readonly selectedCategory = signal<string>('all');
  readonly searchTerm = signal<string>('');
  readonly sortBy = signal<string>('newest');
  readonly isSeedingFirestore = signal<boolean>(false);

  readonly tableColumns = ['image', 'name', 'price', 'stock', 'actions'];

  readonly totalCount = computed(() => this.productsService.products().length);

  /**
   * Señal computada para filtrado en tiempo real reactivo y de alto rendimiento.
   * Filtra por nombre o por categoría a medida que el usuario escribe.
   */
  readonly filteredProducts = computed(() => {
    let list = this.productsService.products();
    const cat = this.selectedCategory();
    const query = this.searchTerm().toLowerCase().trim();
    const sort = this.sortBy();

    // 1. Filtrado por chip de categoría seleccionado
    if (cat !== 'all') {
      list = list.filter(p => p.categoryId === cat);
    }

    // 2. Filtrado en tiempo real por NOMBRE o CATEGORÍA
    if (query) {
      list = list.filter(p => {
        const matchName = p.name.toLowerCase().includes(query);
        const matchCategory = (p.categoryName || '').toLowerCase().includes(query);
        const matchDescription = (p.description || '').toLowerCase().includes(query);
        return matchName || matchCategory || matchDescription;
      });
    }

    // 3. Ordenación en memoria
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

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
  }

  selectCategory(catId: string): void {
    this.selectedCategory.set(catId);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchTerm.set('');
    this.sortBy.set('newest');
  }

  async seedFirestoreProducts(): Promise<void> {
    this.isSeedingFirestore.set(true);
    try {
      await this.firebase.initializeProductsCollection();
      this.productsService.loadProducts().subscribe();
    } finally {
      this.isSeedingFirestore.set(false);
    }
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
