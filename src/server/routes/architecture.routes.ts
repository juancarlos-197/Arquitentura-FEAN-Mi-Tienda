import { Router } from 'express';
import { store } from '../data/store';

export const architectureRouter = Router();

architectureRouter.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      stack: 'FEAN (Firebase, Express, Angular, Node.js)',
      status: 'OPERATIONAL',
      layers: {
        frontend: {
          framework: 'Angular 22 (Standalone zoneless)',
          modules: ['core', 'features', 'shared'],
          stateManagement: 'Angular Signals',
          uiLibrary: 'Angular Material + Tailwind CSS v4',
        },
        backend: {
          runtime: 'Node.js',
          engine: 'Express 5 REST API',
          middleware: ['authMiddleware', 'cors', 'express.json', 'SSR AngularNodeAppEngine'],
          uptimeSeconds: Math.floor(process.uptime()),
        },
        database: {
          service: 'Firebase Cloud Firestore & Authentication',
          collections: ['products', 'categories', 'users', 'orders'],
          counts: {
            products: store.getProducts().length,
            categories: store.getCategories().length,
            users: store.getUsers().length,
            orders: store.getOrders().length,
          },
          status: 'CONNECTED',
        },
      },
      timestamp: new Date().toISOString(),
    },
  });
});

architectureRouter.post('/reset-data', (req, res) => {
  store.resetData();
  res.json({
    success: true,
    message: 'Base de datos de Firebase Firestore restablecida con los datos semilla iniciales.',
  });
});
