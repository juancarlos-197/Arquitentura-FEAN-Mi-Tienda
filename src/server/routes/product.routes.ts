import { Router } from 'express';
import { store } from '../data/store';
import { Product } from '../../app/shared/models';

export const productRouter = Router();

productRouter.get('/', (req, res) => {
  let products = [...store.getProducts()];

  const { q, categoryId, minPrice, maxPrice, sortBy, activeOnly } = req.query;

  if (activeOnly === 'true') {
    products = products.filter(p => p.active);
  }

  if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
    products = products.filter(p => p.categoryId === categoryId);
  }

  if (q && typeof q === 'string') {
    const term = q.toLowerCase().trim();
    products = products.filter(
      p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  if (sortBy) {
    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  }

  res.json({
    success: true,
    data: products,
    total: products.length,
  });
});

productRouter.get('/:id', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado' });
  }
  return res.json({ success: true, data: product });
});

productRouter.post('/', (req, res) => {
  const { name, description, price, stock, categoryId, imageUrl, active } = req.body;
  if (!name || !price || !categoryId) {
    return res.status(400).json({ success: false, error: 'Nombre, precio y categoría son requeridos' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: name.trim(),
    description: description || '',
    price: parseFloat(price),
    stock: parseInt(stock, 10) || 0,
    categoryId,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    active: active !== undefined ? Boolean(active) : true,
    rating: 5.0,
    reviewsCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = store.addProduct(newProduct);
  return res.status(201).json({
    success: true,
    data: created,
    message: 'Producto creado correctamente en Firebase Firestore',
  });
});

productRouter.put('/:id', (req, res) => {
  const { name, description, price, stock, categoryId, imageUrl, active } = req.body;
  const updates: Partial<Product> = {};

  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = parseFloat(price);
  if (stock !== undefined) updates.stock = parseInt(stock, 10);
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (active !== undefined) updates.active = Boolean(active);

  const updated = store.updateProduct(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado' });
  }

  return res.json({
    success: true,
    data: updated,
    message: 'Producto actualizado correctamente',
  });
});

productRouter.delete('/:id', (req, res) => {
  const ok = store.deleteProduct(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado' });
  }
  return res.json({ success: true, message: `Producto '${req.params.id}' eliminado correctamente del servidor API REST` });
});

productRouter.delete('/', (req, res) => {
  store.clearProducts();
  return res.json({ success: true, message: 'Todos los productos han sido eliminados del servidor API REST' });
});
