import { Router } from 'express';
import { store } from '../data/store';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Correo y contraseña son obligatorios' });
  }

  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Credenciales inválidas o usuario no encontrado' });
  }

  if (!user.active) {
    return res.status(403).json({ success: false, error: 'Esta cuenta está desactivada por el administrador' });
  }

  // Generate FEAN Firebase token simulation
  const token = `fean_token_${user.id}`;
  return res.json({
    success: true,
    data: {
      token,
      user,
    },
    message: `Bienvenido de nuevo, ${user.name}`,
  });
});

authRouter.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Nombre, correo y contraseña son obligatorios' });
  }

  const existing = store.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Ya existe una cuenta registrada con este correo' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: 'CUSTOMER' as const,
    active: true,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.addUser(newUser);
  const token = `fean_token_${newUser.id}`;

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: newUser,
    },
    message: 'Cuenta creada con éxito en Firebase & Express',
  });
});

authRouter.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'El correo electrónico es requerido' });
  }

  const user = store.getUserByEmail(email);
  // Always return friendly message for security
  return res.json({
    success: true,
    message: user
      ? `Se ha enviado un enlace de recuperación de contraseña a ${email}`
      : `Si el correo existe en nuestro sistema, recibirá un enlace de recuperación.`,
  });
});

authRouter.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'No autenticado' });
  }
  const user = store.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  return res.json({ success: true, data: user });
});
