import { Router } from 'express';
import { store } from '../data/store';
import { DashboardSummary } from '../../app/shared/models';

export const dashboardRouter = Router();

dashboardRouter.get('/', (req, res) => {
  const products = store.getProducts();
  const categories = store.getCategories();
  const users = store.getUsers();
  const orders = store.getOrders();

  // Total sales from non-cancelled orders
  const nonCancelledOrders = orders.filter(o => o.status !== 'CANCELLED');
  const totalSales = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

  // Sales by category
  const categorySalesMap: Record<string, number> = {};
  for (const cat of categories) {
    categorySalesMap[cat.id] = 0;
  }

  for (const order of nonCancelledOrders) {
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.categoryId) {
        categorySalesMap[prod.categoryId] = (categorySalesMap[prod.categoryId] || 0) + item.subtotal;
      }
    }
  }

  const salesByCategory = categories.map(cat => {
    const amount = Math.round((categorySalesMap[cat.id] || 0) * 100) / 100;
    const percentage = totalSales > 0 ? Math.round((amount / totalSales) * 100) : 0;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      amount,
      percentage,
    };
  });

  // Recent 5 orders
  const recentOrders = [...orders].slice(0, 5);

  // Monthly sales simulation based on real data
  const monthlySales = [
    { month: 'Nov', revenue: 1420.00, orders: 12 },
    { month: 'Dic', revenue: 2850.50, orders: 24 },
    { month: 'Ene', revenue: 1980.00, orders: 18 },
    { month: 'Feb', revenue: 2450.00, orders: 21 },
    { month: 'Mar', revenue: Math.round(totalSales * 100) / 100, orders: orders.length },
  ];

  const summary: DashboardSummary = {
    totalSales: Math.round(totalSales * 100) / 100,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalUsers: users.length,
    recentOrders,
    salesByCategory,
    monthlySales,
  };

  res.json({
    success: true,
    data: summary,
  });
});
