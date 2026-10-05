import { Router } from 'express';
import { authRouter } from './auth.routes';
import { productRouter } from './product.routes';
import { categoryRouter } from './category.routes';
import { userRouter } from './user.routes';
import { orderRouter } from './order.routes';
import { dashboardRouter } from './dashboard.routes';
import { architectureRouter } from './architecture.routes';
import { authMiddleware } from '../middleware/auth.middleware';

export const apiRouter = Router();

// Apply global auth token middleware for /api
apiRouter.use(authMiddleware);

apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/architecture', architectureRouter);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Mi Tienda - FEAN Architecture',
    timestamp: new Date().toISOString(),
  });
});
