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
import { Firebase } from '../../../../core/services/firebase';

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
    <div class="space-y-8">
      <app-page-header
        title="Arquitectura FEAN & Laboratorio en Vivo"
        subtitle="Ejemplos prácticos de API REST (Express), Firebase Authentication y Cloud Firestore NoSQL"
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
        <!-- 3-LAYER VISUAL OVERVIEW -->
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
                  <span class="text-slate-800">Signals (Cart, Auth, Filter)</span>
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
                  <span class="text-amber-800 font-mono text-[11px]">{{ firebaseConfig.projectId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Base de Datos:</span>
                  <span class="text-slate-800 font-mono text-[10px] truncate max-w-[120px]">{{ firebaseConfig.firestoreDatabaseId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-semibold">Total Documentos:</span>
                  <span class="text-slate-900 font-bold">
                    {{ (data()!.layers.database.counts['products'] || 0) + (data()!.layers.database.counts['orders'] || 0) }} docs
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Cloud Firestore Status</span>
              <span class="text-emerald-600 font-bold">PROVISIONED & ACTIVE</span>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- LIVE LABS: 3 PRACTICAL EXAMPLES REQUESTED BY USER                     -->
        <!-- 1. API REST  |  2. FIREBASE AUTH  |  3. CLOUD FIRESTORE NOSQL       -->
        <!-- =================================================================== -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <div class="flex items-center gap-2 text-indigo-600 mb-1">
              <mat-icon>science</mat-icon>
              <span class="text-xs font-bold uppercase tracking-wider">Laboratorio de Pruebas en Vivo</span>
            </div>
            <h3 class="font-extrabold text-2xl text-slate-900">
              Ejemplos Interactivos de la Arquitectura FEAN
            </h3>
            <p class="text-sm text-slate-500 mt-1">
              Prueba en tiempo real una petición a la <strong>API REST</strong>, el flujo de <strong>Firebase Authentication</strong> y operaciones NoSQL en <strong>Cloud Firestore</strong>.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- EJEMPLO 1: API REST CON EXPRESS -->
            <div class="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 p-5 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                    Ejemplo 1
                  </span>
                  <span class="text-xs font-mono text-emerald-700 font-bold">Node.js + Express 5</span>
                </div>

                <h4 class="font-bold text-base text-slate-900 flex items-center gap-2">
                  <mat-icon class="text-emerald-600">api</mat-icon>
                  API REST Endpoints
                </h4>

                <p class="text-xs text-slate-600 leading-relaxed">
                  Petición HTTP asíncrona enviada a través de <code class="bg-white px-1 py-0.5 rounded text-emerald-700">HttpClient</code> hacia el backend Express con middleware de autenticación y formato JSON.
                </p>

                <!-- Code snippet -->
                <div class="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[11px] overflow-x-auto">
                  <span class="text-emerald-400">// Petición REST</span><br/>
                  this.http.get('/api/products')<br/>
                  &nbsp;.subscribe(res => ...);
                </div>

                <!-- Live Result Box -->
                @if (restResult()) {
                  <div class="bg-white rounded-xl p-3 border border-emerald-200 text-xs font-mono space-y-1">
                    <div class="text-emerald-700 font-bold flex items-center justify-between">
                      <span>HTTP 200 OK</span>
                      <span>{{ restTime() }} ms</span>
                    </div>
                    <div class="text-slate-600 text-[11px] truncate">{{ restResult() }}</div>
                  </div>
                }
              </div>

              <div class="space-y-2">
                <button
                  type="button"
                  mat-flat-button
                  color="primary"
                  (click)="runRestExample()"
                  class="w-full !rounded-xl !font-bold"
                >
                  <mat-icon class="mr-1">send</mat-icon>
                  Ejecutar GET /api/products
                </button>

                <button
                  type="button"
                  mat-stroked-button
                  color="warn"
                  (click)="runDeleteRestExample()"
                  class="w-full !rounded-xl !font-bold"
                >
                  <mat-icon class="mr-1">delete_outline</mat-icon>
                  Borrar en Servidor API REST
                </button>
              </div>
            </div>

            <!-- EJEMPLO 2: FIREBASE AUTHENTICATION -->
            <div class="rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/20 p-5 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800">
                    Ejemplo 2
                  </span>
                  <span class="text-xs font-mono text-indigo-700 font-bold">Firebase Auth</span>
                </div>

                <h4 class="font-bold text-base text-slate-900 flex items-center gap-2">
                  <mat-icon class="text-indigo-600">verified_user</mat-icon>
                  Autenticación con Google
                </h4>

                <p class="text-xs text-slate-600 leading-relaxed">
                  Autenticación segura con <code class="bg-white px-1 py-0.5 rounded text-indigo-700">signInWithPopup</code> y proveedor Google, verificación de token JWT y rol RBAC.
                </p>

                <!-- Code snippet -->
                <div class="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[11px] overflow-x-auto">
                  <span class="text-indigo-400">// Firebase Auth</span><br/>
                  const provider = new GoogleAuthProvider();<br/>
                  signInWithPopup(auth, provider);
                </div>

                <!-- Live Result Box -->
                <div class="bg-white rounded-xl p-3 border border-indigo-200 text-xs space-y-1">
                  @if (firebaseService.fireauthUser()) {
                    <div class="text-emerald-700 font-bold flex items-center gap-1">
                      <mat-icon class="text-sm">check_circle</mat-icon> Sesión Activa
                    </div>
                    <div class="text-slate-800 font-semibold">{{ firebaseService.fireauthUser()?.displayName }}</div>
                    <div class="text-slate-500 text-[11px] truncate">{{ firebaseService.fireauthUser()?.email }}</div>
                    <div class="text-slate-400 text-[10px] font-mono">UID: {{ firebaseService.fireauthUser()?.uid }}</div>
                  } @else {
                    <div class="text-slate-500 text-[11px]">No hay sesión iniciada en Firebase Auth</div>
                  }
                </div>
              </div>

              <div class="flex gap-2">
                @if (firebaseService.fireauthUser()) {
                  <button
                    type="button"
                    mat-stroked-button
                    color="warn"
                    (click)="firebaseService.logout()"
                    class="w-full !rounded-xl !font-bold"
                  >
                    <mat-icon class="mr-1">logout</mat-icon>
                    Cerrar Sesión Firebase
                  </button>
                } @else {
                  <button
                    type="button"
                    mat-flat-button
                    color="primary"
                    (click)="firebaseService.signInWithGoogle()"
                    class="w-full !rounded-xl !font-bold"
                  >
                    <mat-icon class="mr-1">login</mat-icon>
                    Iniciar Sesión Google
                  </button>
                }
              </div>
            </div>

            <!-- EJEMPLO 3: CLOUD FIRESTORE NOSQL -->
            <div class="rounded-2xl border-2 border-amber-500/30 bg-amber-50/20 p-5 flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800">
                    Ejemplo 3
                  </span>
                  <span class="text-xs font-mono text-amber-700 font-bold">Cloud Firestore</span>
                </div>

                <h4 class="font-bold text-base text-slate-900 flex items-center gap-2">
                  <mat-icon class="text-amber-600">local_fire_department</mat-icon>
                  Base de Datos NoSQL
                </h4>

                <p class="text-xs text-slate-600 leading-relaxed">
                  Operaciones directas sobre colecciones NoSQL con <code class="bg-white px-1 py-0.5 rounded text-amber-700">addDoc</code> y <code class="bg-white px-1 py-0.5 rounded text-amber-700">getDocs</code> con timestamps sincronizados.
                </p>

                <!-- Code snippet -->
                <div class="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[11px] overflow-x-auto">
                  <span class="text-amber-400">// Cloud Firestore</span><br/>
                  await addDoc(collection(db, 'test'), &#123;<br/>
                  &nbsp;&nbsp;mensaje: 'Hola FEAN', timestamp<br/>
                  &#125;);
                </div>

                <!-- Live Result Box -->
                @if (firestoreLastId()) {
                  <div class="bg-white rounded-xl p-3 border border-amber-200 text-xs font-mono space-y-1">
                    <div class="text-amber-800 font-bold">Doc creado en Firestore:</div>
                    <div class="text-indigo-600 text-[11px] truncate font-bold">ID: {{ firestoreLastId() }}</div>
                    <div class="text-slate-400 text-[10px]">Base: {{ firebaseConfig.firestoreDatabaseId }}</div>
                  </div>
                }
              </div>

              <div class="space-y-2">
                <button
                  type="button"
                  mat-flat-button
                  color="accent"
                  (click)="runFirestoreExample()"
                  class="w-full !rounded-xl !font-bold"
                >
                  <mat-icon class="mr-1">add_circle</mat-icon>
                  Insertar Doc de Prueba
                </button>

                <button
                  type="button"
                  mat-stroked-button
                  color="primary"
                  (click)="seedFirestoreProducts()"
                  class="w-full !rounded-xl !font-bold text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
                >
                  <mat-icon class="mr-1 text-amber-600">inventory</mat-icon>
                  Iniciar Colección 'products' en Firestore
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ARCHITECTURE COMPARISON DETAILS -->
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
  readonly firebaseService = inject(Firebase);

  readonly loading = signal<boolean>(false);
  readonly data = signal<ArchitectureData | null>(null);
  readonly firebaseConfig = FIREBASE_CONFIG;

  // Estados interactivos para los ejemplos solicitados
  readonly restResult = signal<string | null>(null);
  readonly restTime = signal<number>(0);
  readonly firestoreLastId = signal<string | null>(null);

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

  // Ejemplo 1: Petición API REST Express
  runRestExample(): void {
    const t0 = performance.now();
    this.http.get<{ success: boolean; data: unknown[]; total: number }>(API_CONFIG.endpoints.products).subscribe({
      next: (res) => {
        const elapsed = Math.round(performance.now() - t0);
        this.restTime.set(elapsed);
        this.restResult.set(`Recibidos ${res.total} productos desde Express REST API en ${elapsed}ms.`);
        this.notification.success('Petición REST ejecutada con éxito (Status: 200 OK)');
      },
      error: (err) => {
        this.notification.error('Error al ejecutar petición REST');
        console.error(err);
      },
    });
  }

  // Ejemplo 1B: Borrar en servidor API REST (DELETE /api/products/:id)
  runDeleteRestExample(): void {
    const t0 = performance.now();
    this.http.get<{ success: boolean; data: { id: string; name: string }[] }>(API_CONFIG.endpoints.products).subscribe({
      next: (res) => {
        if (!res.data || res.data.length === 0) {
          this.notification.warning('No hay productos en el servidor para borrar');
          return;
        }
        const target = res.data[res.data.length - 1];
        this.http.delete<{ success: boolean; message: string }>(`${API_CONFIG.endpoints.products}/${target.id}`).subscribe({
          next: (delRes) => {
            const elapsed = Math.round(performance.now() - t0);
            this.restTime.set(elapsed);
            this.restResult.set(`DELETE 200 OK: ${delRes.message} en ${elapsed}ms`);
            this.notification.success(`Borrado en API REST: ${delRes.message}`);
            this.loadStatus();
          },
          error: (err) => {
            this.notification.error('Error al borrar en el servidor REST');
            console.error(err);
          },
        });
      },
      error: (err) => {
        this.notification.error('Error al consultar productos para borrar');
        console.error(err);
      },
    });
  }

  // Ejemplo 3: Escritura directa en Cloud Firestore NoSQL
  async runFirestoreExample(): Promise<void> {
    try {
      const docId = await this.firebaseService.addDocument('test', {
        origen: 'Laboratorio FEAN - Angular Client',
        accion: 'Prueba de Escritura NoSQL Directa',
        usuario: this.firebaseService.fireauthUser()?.email || 'anonimo@fean.com',
        timestampLocal: new Date().toISOString(),
      });
      this.firestoreLastId.set(docId);
      this.loadStatus();
    } catch (err) {
      console.error(err);
    }
  }

  async seedFirestoreProducts(): Promise<void> {
    try {
      const res = await this.firebaseService.initializeProductsCollection();
      if (res) {
        this.firestoreLastId.set(`products: ${res.count} docs`);
        this.loadStatus();
      }
    } catch (err) {
      console.error(err);
    }
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
