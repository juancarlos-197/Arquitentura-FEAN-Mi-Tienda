import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../../../shared/models';
import { Categories } from '../../services/categories';

export interface CategoryDialogData {
  category?: Category;
}

@Component({
  selector: 'app-category-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="p-6 max-w-lg w-full">
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <mat-icon>{{ data.category ? 'edit' : 'add_box' }}</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ data.category ? 'Editar Categoría' : 'Nueva Categoría' }}
            </h2>
            <p class="text-xs text-slate-500">Gestión de catálogo en Firebase Firestore</p>
          </div>
        </div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon class="text-slate-400">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombre de la Categoría *</mat-label>
            <input matInput formControlName="name" placeholder="Ej. Accesorios de Viaje" />
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <mat-error>El nombre es obligatorio</mat-error>
            }
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Icono Material</mat-label>
            <input matInput formControlName="icon" placeholder="devices, chair, local_cafe, checkroom..." />
            <mat-icon matSuffix class="text-indigo-600 mr-2">{{ form.controls.icon.value || 'category' }}</mat-icon>
          </mat-form-field>
        </div>

        <div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Descripción</mat-label>
            <textarea
              matInput
              rows="3"
              formControlName="description"
              placeholder="Breve reseña sobre los productos incluidos..."
            ></textarea>
          </mat-form-field>
        </div>

        <div class="pt-2">
          <mat-slide-toggle formControlName="active" color="primary">
            <span class="text-sm font-medium text-slate-700">Categoría Activa y Visible en Tienda</span>
          </mat-slide-toggle>
        </div>

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
                Guardando...
              </span>
            } @else {
              <span class="flex items-center gap-1.5">
                <mat-icon class="text-sm">save</mat-icon>
                {{ data.category ? 'Guardar Cambios' : 'Crear Categoría' }}
              </span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CategoryFormDialog {
  readonly dialogRef = inject(MatDialogRef<CategoryFormDialog>);
  readonly data: CategoryDialogData = inject(MAT_DIALOG_DATA);
  private readonly categoriesService = inject(Categories);

  readonly isSubmitting = signal<boolean>(false);

  readonly form = new FormGroup({
    name: new FormControl<string>(this.data.category?.name || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    icon: new FormControl<string>(this.data.category?.icon || 'category', {
      nonNullable: true,
    }),
    description: new FormControl<string>(this.data.category?.description || '', {
      nonNullable: true,
    }),
    active: new FormControl<boolean>(this.data.category ? this.data.category.active : true, {
      nonNullable: true,
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.form.getRawValue();

    if (this.data.category) {
      this.categoriesService.updateCategory(this.data.category.id, val).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
    } else {
      this.categoriesService.createCategory(val).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.dialogRef.close(res.data);
        },
        error: () => this.isSubmitting.set(false),
      });
    }
  }
}
