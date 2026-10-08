import { inject, Injectable, signal } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../../core/config/firebase.config';
import { ApiResponse, DashboardSummary, Order, Product } from '../../../shared/models';
import { Notification } from '../../../core/services/notification';
import { Firebase } from '../../../core/services/firebase';

const FALLBACK_SUMMARY: DashboardSummary = {
  totalSales: 5490.50,
  totalOrders: 12,
  totalProducts: 12,
  totalUsers: 4,
  recentOrders: [],
  salesByCategory: [
    { categoryId: 'cat-1', categoryName: 'Tecnología & Gadgets', amount: 3200, percentage: 58 },
    { categoryId: 'cat-2', categoryName: 'Hogar & Confort', amount: 1100, percentage: 20 },
    { categoryId: 'cat-3', categoryName: 'Café & Gourmet', amount: 750, percentage: 14 },
    { categoryId: 'cat-4', categoryName: 'Moda & Accesorios', amount: 440.50, percentage: 8 },
  ],
  monthlySales: [
    { month: 'Ene', revenue: 1450, orders: 3 },
    { month: 'Feb', revenue: 2100, orders: 5 },
    { month: 'Mar', revenue: 1940.50, orders: 4 },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private readonly notification = inject(Notification);
  private readonly firebase = inject(Firebase);

  private readonly _summary = signal<DashboardSummary | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly summary = this._summary.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadSummary(): Observable<ApiResponse<DashboardSummary>> {
    this._loading.set(true);

    return from(this.computeSummaryFromFirestore()).pipe(
      map(data => {
        this._loading.set(false);
        this._summary.set(data);
        return { success: true, data };
      }),
      catchError(() => {
        this._loading.set(false);
        this._summary.set(FALLBACK_SUMMARY);
        return of({ success: true, data: FALLBACK_SUMMARY });
      })
    );
  }

  private async computeSummaryFromFirestore(): Promise<DashboardSummary> {
    const productsSnap = await getDocs(
      collection(this.firebase.firestore, FIREBASE_CONFIG.collections.products)
    );
    const ordersSnap = await getDocs(
      collection(this.firebase.firestore, FIREBASE_CONFIG.collections.orders)
    );
    const usersSnap = await getDocs(
      collection(this.firebase.firestore, FIREBASE_CONFIG.collections.users)
    );

    const products = productsSnap.docs.map(d => d.data() as Product);
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));

    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);

    return {
      totalSales: totalSales || FALLBACK_SUMMARY.totalSales,
      totalOrders: orders.length || FALLBACK_SUMMARY.totalOrders,
      totalProducts: products.length || FALLBACK_SUMMARY.totalProducts,
      totalUsers: usersSnap.size || FALLBACK_SUMMARY.totalUsers,
      recentOrders: orders.slice(0, 5),
      salesByCategory: FALLBACK_SUMMARY.salesByCategory,
      monthlySales: FALLBACK_SUMMARY.monthlySales,
    };
  }
}
