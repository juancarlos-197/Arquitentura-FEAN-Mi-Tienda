import { Router } from 'express';
import { store } from '../data/store';
import { Order, OrderStatus } from '../../app/shared/models';

export const orderRouter = Router();

orderRouter.get('/', (req, res) => {
  const { customerId, status } = req.query;
  let orders = [...store.getOrders()];

  if (customerId && typeof customerId === 'string') {
    orders = orders.filter(o => o.customerId === customerId);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }

  res.json({
    success: true,
    data: orders,
  });
});

orderRouter.get('/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
  }
  return res.json({ success: true, data: order });
});

orderRouter.post('/', (req, res) => {
  const { customerId, customerName, customerEmail, items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'El pedido debe contener al menos un producto' });
  }

  if (!shippingAddress) {
    return res.status(400).json({ success: false, error: 'La dirección de entrega es obligatoria' });
  }

  // Calculate order total
  const calculatedTotal = items.reduce((sum: number, item: { productPrice: number; quantity: number }) => {
    return sum + (item.productPrice * item.quantity);
  }, 0);

  const orderId = `ORD-2026-${String(store.getOrders().length + 1).padStart(3, '0')}`;

  const newOrder: Order = {
    id: orderId,
    customerId: customerId || 'user-guest',
    customerName: customerName || 'Cliente Invitado',
    customerEmail: customerEmail || 'cliente@mitienda.com',
    items,
    total: Math.round(calculatedTotal * 100) / 100,
    status: 'PENDING',
    shippingAddress,
    paymentMethod: paymentMethod || 'Tarjeta de Débito/Crédito',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = store.addOrder(newOrder);

  return res.status(201).json({
    success: true,
    data: created,
    message: `Pedido #${created.id} procesado con éxito`,
  });
});

orderRouter.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
    });
  }

  const updated = store.updateOrderStatus(req.params.id, status as OrderStatus);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
  }

  return res.json({
    success: true,
    data: updated,
    message: `Estado del pedido #${updated.id} cambiado a ${status}`,
  });
});
