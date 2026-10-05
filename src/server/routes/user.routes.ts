import { Router } from 'express';
import { store } from '../data/store';
import { User, UserRole } from '../../app/shared/models';

export const userRouter = Router();

userRouter.get('/', (req, res) => {
  const users = store.getUsers();
  res.json({ success: true, data: users });
});

userRouter.get('/:id', (req, res) => {
  const user = store.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  return res.json({ success: true, data: user });
});

userRouter.post('/', (req, res) => {
  const { name, email, role, phone, active } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Nombre y correo electrónico son requeridos' });
  }

  const existing = store.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Ya existe un usuario con este correo' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: (role as UserRole) || 'CUSTOMER',
    active: active !== undefined ? Boolean(active) : true,
    phone: phone || '',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = store.addUser(newUser);
  return res.status(201).json({
    success: true,
    data: created,
    message: 'Usuario registrado correctamente en Firebase Authentication',
  });
});

userRouter.put('/:id', (req, res) => {
  const { name, email, role, phone, active } = req.body;
  const updates: Partial<User> = {};

  if (name !== undefined) updates.name = name.trim();
  if (email !== undefined) updates.email = email.trim().toLowerCase();
  if (role !== undefined) updates.role = role as UserRole;
  if (phone !== undefined) updates.phone = phone;
  if (active !== undefined) updates.active = Boolean(active);

  const updated = store.updateUser(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }

  return res.json({
    success: true,
    data: updated,
    message: 'Usuario actualizado correctamente',
  });
});

userRouter.delete('/:id', (req, res) => {
  if (req.params.id === 'user-admin') {
    return res.status(400).json({ success: false, error: 'No es posible eliminar al Administrador principal del sistema' });
  }

  const ok = store.deleteUser(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  return res.json({ success: true, message: 'Usuario eliminado correctamente' });
});
