import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../../shared/models';
import { Products } from '../../services/products';
import { Categories } from '../../../categories/services/categories';

export interface ProductDialogData {
  product?: Product;
}

@Component({
  selector: 'app-product-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <mat-icon>{{ data.product ? 'edit' : 'add_shopping_cart' }}</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ data.product ? 'Editar Producto' : 'Crear Nuevo Producto' }}
            </h2>
            <p class="text-xs text-slate-500">Persistencia directa en Firebase Firestore vía Express</p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon class="text-slate-400">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Name -->
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre del Producto *</mat-label>
            <input matInput formControlName="name" placeholder="Ej. Audífonos Wireless Studio 3" />
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <mat-error>El nombre del producto es obligatorio</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Category & Price Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Categoría *</mat-label>
              <mat-select formControlName="categoryId" placeholder="Selecciona una categoría">
                @for (cat of categoriesService.categories(); track cat.id) {
                  <mat-option [value]="cat.id">
                    <span class="flex items-center gap-2">
                      <mat-icon class="text-sm text-slate-400">{{ cat.icon || 'category' }}</mat-icon>
                      {{ cat.name }}
                    </span>
                  </mat-option>
                }
              </mat-select>
              @if (form.controls.categoryId.invalid && form.controls.categoryId.touched) {
                <mat-error>Debes seleccionar una categoría</mat-error>
              }
            </mat-form-field>
          </div>

          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Precio (€) *</mat-label>
              <input matInput type="number" step="0.01" min="0" formControlName="price" placeholder="0.00" />
              <span matPrefix class="text-slate-400 font-semibold mr-1">€</span>
              @if (form.controls.price.invalid && form.controls.price.touched) {
                <mat-error>Precio válido requerido (mayor a 0)</mat-error>
              }
            </mat-form-field>
          </div>
        </div>

        <!-- Stock & Image URL -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Unidades en Stock *</mat-label>
              <input matInput type="number" min="0" step="1" formControlName="stock" placeholder="10" />
              <mat-icon matPrefix class="text-slate-400 mr-2">inventory</mat-icon>
              @if (form.controls.stock.invalid && form.controls.stock.touched) {
                <mat-error>Stock no puede ser negativo</mat-error>
              }
            </mat-form-field>
          </div>

          <div>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>URL de la Imagen</mat-label>
              <input matInput formControlName="imageUrl" placeholder="https://..." />
              <mat-icon matPrefix class="text-slate-400 mr-2">image</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <!-- Description -->
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Descripción Detallada *</mat-label>
            <textarea
              matInput
              rows="3"
              formControlName="description"
              placeholder="Características técnicas, materiales y especificaciones..."
            ></textarea>
            @if (form.controls.description.invalid && form.controls.description.touched) {
              <mat-error>La descripción es obligatoria</mat-error>
            }
          </mat-form-field>
        </div>

        <!-- Active Switch -->
        <div class="pt-1">
          <mat-slide-toggle formControlName="active" color="primary">
            <span class="text-sm font-medium text-slate-700">Producto Activo (Visible para clientes en catálogo)</span>
          </mat-slide-toggle>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" mat-button (click)="dialogRef.close()">
            Cancelar
          </button>
          <button
            type="submit"
            mat-flat-button
            color="primary"
            [disabled]="form.invalid || isSubmitting()"
            class="rounded-xl px-5"
          >
            @if (isSubmitting()) {
              <span class="flex items-center gap-1.5">
                <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                Guardando en Firestore...
              </span>
            } @else {
              <span class="flex items-center gap-1.5">
                <mat-icon class="text-sm">save</mat-icon>
                {{ data.product ? 'Actualizar Producto' : 'Crear Producto' }}
              </span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ProductFormDialog>);
  readonly data: ProductDialogData = inject(MAT_DIALOG_DATA);
  private readonly productsService = inject(Products);
  readonly categoriesService = inject(Categories);

  readonly isSubmitting = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl<string>(this.data.product?.name || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    categoryId: new FormControl<string>(this.data.product?.categoryId || '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    price: new FormControl<number | null>(this.data.product ? this.data.product.price : null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    stock: new FormControl<number>(this.data.product ? this.data.product.stock : 10, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    imageUrl: new FormControl<string>(
      this.data.product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      { nonNullable: true }
    ),
    description: new FormControl<string>(this.data.product?.description || '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    active: new FormControl<boolean>(this.data.product ? this.data.product.active : true, {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    if (this.categoriesService.categories().length === 0) {
      this.categoriesService.loadCategories().subscribe();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    const payload: Partial<Product> = {
      name: raw.name,
      categoryId: raw.categoryId,
      price: raw.price || 0,
      stock: raw.stock,
      imageUrl: raw.imageUrl,
      description: raw.description,
      active: raw.active,
    };

    if (this.data.product) {
      this.productsService.updateProduct(this.data.product.id, payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
    } else {
      this.productsService.createProduct(payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
    }
  }
}
