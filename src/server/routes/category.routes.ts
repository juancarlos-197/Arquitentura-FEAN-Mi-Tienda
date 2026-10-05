import { Router } from 'express';
import { store } from '../data/store';
import { Category } from '../../app/shared/models';

export const categoryRouter = Router();

categoryRouter.get('/', (req, res) => {
  const categories = store.getCategories();
  res.json({ success: true, data: categories });
});

categoryRouter.get('/:id', (req, res) => {
  const category = store.getCategoryById(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
  }
  return res.json({ success: true, data: category });
});

categoryRouter.post('/', (req, res) => {
  const { name, description, icon, active } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'El nombre de la categoría es obligatorio' });
  }

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    description: description || '',
    icon: icon || 'category',
    active: active !== undefined ? Boolean(active) : true,
    productCount: 0,
    createdAt: new Date().toISOString(),
  };

  const created = store.addCategory(newCat);
  return res.status(201).json({
    success: true,
    data: created,
    message: 'Categoría creada con éxito',
  });
});

categoryRouter.put('/:id', (req, res) => {
  const { name, description, icon, active } = req.body;
  const updated = store.updateCategory(req.params.id, {
    ...(name !== undefined && { name: name.trim() }),
    ...(description !== undefined && { description }),
    ...(icon !== undefined && { icon }),
    ...(active !== undefined && { active: Boolean(active) }),
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
  }
  return res.json({ success: true, data: updated, message: 'Categoría actualizada con éxito' });
});

categoryRouter.delete('/:id', (req, res) => {
  const catId = req.params.id;
  const cat = store.getCategoryById(catId);
  if (!cat) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
  }

  if (cat.productCount && cat.productCount > 0) {
    return res.status(400).json({
      success: false,
      error: `No se puede eliminar la categoría porque tiene ${cat.productCount} productos asociados. Reasígnalos primero.`,
    });
  }

  const ok = store.deleteCategory(catId);
  return res.json({ success: ok, message: 'Categoría eliminada con éxito' });
});
