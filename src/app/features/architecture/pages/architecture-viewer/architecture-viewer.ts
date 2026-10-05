import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Notification } from '../../../../core/services/notification';
import { LoadingSpinner } from '../../../../shared/components/loading/loading-spinner';
import { API_CONFIG } from '../../../../core/config/api.config';
import { FIREBASE_CONFIG } from '../../../../core/config/firebase.config';

interface ArchitectureData {
  stack: string;
  status: string;
  layers: {
    frontend: {
      framework: string;
      modules: string[];
      stateManagement: string;
      uiLibrary: string;
    };
    backend: {
      runtime: string;
      engine: string;
      middleware: string[];
      uptimeSeconds: number;
    };
    database: {
      service: string;
      collections: string[];
      counts: Record<string, number>;
      status: string;
    };
  };
  timestamp: string;
}

@Component({
  selector: 'app-architecture-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PageHeader,
    LoadingSpinner,
  ],
  template: `
    <div class="space-y-6">
      <app-page-header
        title="Arquitectura FEAN (3 Capas)"
        subtitle="Firebase + Express + Angular 22 + Node.js en producción"
        icon="account_tree"
      >
        <div class="flex items-center gap-2">
          <button
            mat-stroked-button
            class="rounded-xl"
            (click)="loadStatus()"
          >
            <mat-icon class="mr-1">sync</mat-icon>
            Comprobar Enlace
          </button>
          <button
            mat-flat-button
            color="warn"
            class="rounded-xl shadow-xs"
            (click)="resetDatabase()"
          >
            <mat-icon class="mr-1">restart_alt</mat-icon>
            Restablecer Semilla Firestore
          </button>
        </div>
      </app-page-header>

      @if (loading() && !data()) {
        <app-loading-spinner message="Interrogando capas FEAN..."></app-loading-spinner>
      } @else if (data()) {
        <!-- Interactive 3-Layer Visual Pipeline -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <!-- Layer 1: Client Angular -->
          <div class="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-md shadow-indigo-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                  Capa 1: Frontend
                </span>
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                  A
                </div>
                <div>
                  <h3 class="font-extrabold text-slate-900 text-lg">Angular 22 Client</h3>
                  <p class="text-xs text-slate-500">Standalone zoneless & Signals</p>
                </div>
              </div>

              <div class="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div class="flex justify-between">
                  <span class="font-semibold">Estructura limpia:</span>
                  <span class="text-indigo-600 font-mono">core/, features/, shared/</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Estado Reactivo:</span>
                  <span class="text-slate-800">Signals (Cart, Auth, Lists)</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Formularios:</span>
                  <span class="text-slate-800">ReactiveForms</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Diseño & UI:</span>
                  <span class="text-slate-800">Angular Material + Tailwind</span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>HTTP / REST Client</span>
              <mat-icon class="text-indigo-400 text-sm">arrow_forward</mat-icon>
            </div>
          </div>

          <!-- Layer 2: Server Express + Node.js -->
          <div class="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-md shadow-emerald-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Capa 2: Servidor
                </span>
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
                  Ex
                </div>
                <div>
                  <h3 class="font-extrabold text-slate-900 text-lg">Node.js + Express 5</h3>
                  <p class="text-xs text-slate-500">API Gateway & Orquestador</p>
                </div>
              </div>

              <div class="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div class="flex justify-between">
                  <span class="font-semibold">Rutas REST:</span>
                  <span class="text-emerald-700 font-mono">/api/products, /api/auth</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Middleware:</span>
                  <span class="text-slate-800">authMiddleware (Token Bearer)</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Control de Acceso:</span>
                  <span class="text-slate-800">requireRole (RBAC)</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Uptime Servidor:</span>
                  <span class="text-slate-800">{{ data()!.layers.backend.uptimeSeconds }} s</span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Admin SDK / Firebase API</span>
              <mat-icon class="text-emerald-400 text-sm">arrow_forward</mat-icon>
            </div>
          </div>

          <!-- Layer 3: Persistence & Firebase -->
          <div class="bg-white rounded-3xl p-6 border-2 border-amber-500 shadow-md shadow-amber-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Capa 3: Firebase
                </span>
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl">
                  🔥
                </div>
                <div>
                  <h3 class="font-extrabold text-slate-900 text-lg">Firebase Services</h3>
                  <p class="text-xs text-slate-500">Firestore & Auth Provider</p>
                </div>
              </div>

              <div class="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div class="flex justify-between">
                  <span class="font-semibold">Proyecto:</span>
                  <span class="text-amber-800 font-mono">{{ firebaseConfig.projectId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Colección 'products':</span>
                  <span class="text-slate-900 font-bold">{{ data()!.layers.database.counts['products'] }} docs</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Colección 'categories':</span>
                  <span class="text-slate-900 font-bold">{{ data()!.layers.database.counts['categories'] }} docs</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Colección 'orders':</span>
                  <span class="text-slate-900 font-bold">{{ data()!.layers.database.counts['orders'] }} docs</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Auth Users:</span>
                  <span class="text-slate-900 font-bold">{{ data()!.layers.database.counts['users'] }} usuarios</span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Cloud Firestore Status</span>
              <span class="text-emerald-600 font-bold">OPERATIONAL</span>
            </div>
          </div>
        </div>

        <!-- Architecture Breakdown Cards -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h3 class="font-bold text-lg text-slate-900">¿Por qué arquitectura FEAN sobre MEAN clásico?</h3>
            <p class="text-xs text-slate-500 mt-1">
              Beneficios estratégicos y separación de responsabilidades implementados en este proyecto
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div class="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div class="flex items-center gap-2 font-bold text-indigo-900">
                <mat-icon class="text-indigo-600">lock_open</mat-icon>
                Seguridad Desacoplada en Múltiples Capas
              </div>
              <p class="text-xs leading-relaxed">
                El cliente nunca realiza operaciones críticas directamente sin pasar por el guardián de Express. Aunque Angular valide con <code class="bg-white px-1 py-0.5 rounded text-indigo-700">RoleGuard</code>, el backend ejecuta <code class="bg-white px-1 py-0.5 rounded text-indigo-700">authMiddleware</code> y valida tokens JWT de Firebase antes de autorizar mutaciones en Firestore.
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div class="flex items-center gap-2 font-bold text-emerald-900">
                <mat-icon class="text-emerald-600">bolt</mat-icon>
                Rendimiento y Reactividad con Signals
              </div>
              <p class="text-xs leading-relaxed">
                El carrito de compras y las listas de productos se gestionan sin Zone.js (Zoneless Angular 21/22), calculando subtotales, impuestos y descuentos instantáneamente en memoria mientras se sincronizan asíncronamente con los endpoints REST.
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ArchitectureViewer implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  readonly loading = signal<boolean>(false);
  readonly data = signal<ArchitectureData | null>(null);
  readonly firebaseConfig = FIREBASE_CONFIG;

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.loading.set(true);
    this.http.get<{ success: boolean; data: ArchitectureData }>(API_CONFIG.endpoints.architecture).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.data.set(res.data);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  resetDatabase(): void {
    this.http.post(API_CONFIG.endpoints.resetData, {}).subscribe({
      next: () => {
        this.notification.success('Base de datos restablecida');
        this.loadStatus();
      },
    });
  }
}
