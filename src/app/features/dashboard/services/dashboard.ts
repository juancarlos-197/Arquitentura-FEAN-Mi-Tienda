import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/config/api.config';
import { ApiResponse, DashboardSummary } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(Notification);

  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadSummary(): Observable<ApiResponse<DashboardSummary>> {
    this._loading.set(true);
    return this.http.get<ApiResponse<DashboardSummary>>(API_CONFIG.endpoints.dashboard).pipe(
      tap(res => {
        this._loading.set(false);
        if (res.success && res.data) {
          this._summary.set(res.data);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        this.notification.error('Error al cargar métricas del Dashboard');
        return throwError(() => err);
      })
    );
  }
}
