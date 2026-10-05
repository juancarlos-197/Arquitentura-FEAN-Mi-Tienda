import { Category, Order, Product, User } from '../../app/shared/models';

export interface DataStore {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
}

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Tecnología & Gadgets',
    description: 'Dispositivos inteligentes, audio de alta fidelidad y accesorios de vanguardia.',
    icon: 'devices',
    active: true,
    productCount: 4,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Hogar & Confort',
    description: 'Muebles ergonómicos, iluminación inteligente y estilo de vida moderno.',
    icon: 'chair',
    active: true,
    productCount: 3,
    createdAt: '2026-01-16T11:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Café & Gourmet',
    description: 'Café de especialidad, cafeteras de precisión y accesorios de barista.',
    icon: 'local_cafe',
    active: true,
    productCount: 3,
    createdAt: '2026-01-18T14:30:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'Moda & Accesorios',
    description: 'Prendas minimalistas con materiales sostenibles y diseño atemporal.',
    icon: 'checkroom',
    active: true,
    productCount: 2,
    createdAt: '2026-02-01T09:15:00.000Z',
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Audífonos Noise-Cancelling Pro Apex',
    description: 'Cancelación activa de ruido híbrida de 42dB, drivers de 40mm de berilio y hasta 45 horas de autonomía ultralarga con carga rápida USB-C.',
    price: 249.99,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    categoryName: 'Tecnología & Gadgets',
    active: true,
    rating: 4.9,
    reviewsCount: 142,
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-02-10T12:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Teclado Mecánico Wireless Tactile 75%',
    description: 'Interruptores lubricados de fábrica, switches intercambiables en caliente (hot-swap), chasis de aluminio anodizado CNC y conexión tri-modo.',
    price: 139.50,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    categoryName: 'Tecnología & Gadgets',
    active: true,
    rating: 4.8,
    reviewsCount: 89,
    createdAt: '2026-02-12T15:20:00.000Z',
    updatedAt: '2026-02-12T15:20:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Smartwatch Titan Ultra OLED',
    description: 'Monitorización continua de SpO2, ECG, GPS dual multibanda, pantalla AMOLED de 2000 nits protegida por zafiro y caja de titanio aeroespacial.',
    price: 320.00,
    stock: 19,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    categoryName: 'Tecnología & Gadgets',
    active: true,
    rating: 4.7,
    reviewsCount: 64,
    createdAt: '2026-02-15T09:40:00.000Z',
    updatedAt: '2026-02-15T09:40:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Cargador Rápido GaN 100W 4-Puertos',
    description: 'Tecnología de nitruro de galio (GaN III) compacta con 3 puertos USB-C PD 3.0 y 1 USB-A, capaz de alimentar portátiles y smartphones a máxima velocidad.',
    price: 59.99,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1',
    categoryName: 'Tecnología & Gadgets',
    active: true,
    rating: 4.9,
    reviewsCount: 110,
    createdAt: '2026-02-18T10:00:00.000Z',
    updatedAt: '2026-02-18T10:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'Silla Ergonómica Lumbar AirMesh',
    description: 'Soporte dinámico tridimensional para la zona lumbar, reposabrazos 4D ajustables y malla transpirable de alta tensión certificada BIFMA.',
    price: 389.00,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c94380696752?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-2',
    categoryName: 'Hogar & Confort',
    active: true,
    rating: 4.8,
    reviewsCount: 78,
    createdAt: '2026-02-20T11:15:00.000Z',
    updatedAt: '2026-02-20T11:15:00.000Z',
  },
  {
    id: 'prod-6',
    name: 'Lámpara de Escritorio Minimalista Halo',
    description: 'Control táctil gradual, temperatura de color ajustable (2700K - 6500K), sensor de luz ambiental y puerto de carga inalámbrico Qi integrado en la base.',
    price: 84.50,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-2',
    categoryName: 'Hogar & Confort',
    active: true,
    rating: 4.6,
    reviewsCount: 52,
    createdAt: '2026-02-22T13:30:00.000Z',
    updatedAt: '2026-02-22T13:30:00.000Z',
  },
  {
    id: 'prod-7',
    name: 'Difusor Ultrasónico Cerámico Zen',
    description: 'Cuerpo de cerámica artesanal mate, temporizador con apagado inteligente y luz cálida relajante para difusión de aceites esenciales puros.',
    price: 49.00,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-2',
    categoryName: 'Hogar & Confort',
    active: true,
    rating: 4.7,
    reviewsCount: 41,
    createdAt: '2026-02-23T16:00:00.000Z',
    updatedAt: '2026-02-23T16:00:00.000Z',
  },
  {
    id: 'prod-8',
    name: 'Cafetera Espresso Manual Barista Precision',
    description: 'Grupo térmico de 58mm profesional, manómetro analógico para control de extracción precisa a 9 bares y vaporizador de acero inox.',
    price: 450.00,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-3',
    categoryName: 'Café & Gourmet',
    active: true,
    rating: 4.9,
    reviewsCount: 95,
    createdAt: '2026-02-25T08:00:00.000Z',
    updatedAt: '2026-02-25T08:00:00.000Z',
  },
  {
    id: 'prod-9',
    name: 'Molinillo Cónico de Muelas de Titanio',
    description: 'Micrometría continua con 60 niveles de molienda calibrados desde cold brew hasta espresso ultra fino con retención casi nula.',
    price: 185.00,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-3',
    categoryName: 'Café & Gourmet',
    active: true,
    rating: 4.8,
    reviewsCount: 68,
    createdAt: '2026-02-26T10:20:00.000Z',
    updatedAt: '2026-02-26T10:20:00.000Z',
  },
  {
    id: 'prod-10',
    name: 'Café Geisha Especialidad Finca El Mirador',
    description: 'Tostado medio artesanal con notas a flor de jazmín, bergamota, melocotón y miel de flores silvestres. Puntuación SCA 91.5 puntos.',
    price: 26.50,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-3',
    categoryName: 'Café & Gourmet',
    active: true,
    rating: 5.0,
    reviewsCount: 130,
    createdAt: '2026-02-27T14:00:00.000Z',
    updatedAt: '2026-02-27T14:00:00.000Z',
  },
  {
    id: 'prod-11',
    name: 'Mochila Commuter Impermeable de Cordura',
    description: 'Compartimento acolchado para portátil de 16", cierres YKK sellados hidrófugos, bolsillo oculto RFID y tirantes ergonómicos acolchados.',
    price: 115.00,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-4',
    categoryName: 'Moda & Accesorios',
    active: true,
    rating: 4.7,
    reviewsCount: 48,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'prod-12',
    name: 'Billetera Minimalista Bifold en Cuero Vegano',
    description: 'Diseño ultrafino para hasta 8 tarjetas y billetes sin abultar, bloqueo antirrobo RFID y costuras reforzadas de grado militar.',
    price: 38.00,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-4',
    categoryName: 'Moda & Accesorios',
    active: true,
    rating: 4.8,
    reviewsCount: 39,
    createdAt: '2026-03-02T11:00:00.000Z',
    updatedAt: '2026-03-02T11:00:00.000Z',
  },
];

export const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Carlos Mendoza (Admin)',
    email: 'admin@mitienda.com',
    role: 'ADMIN',
    active: true,
    phone: '+34 611 223 344',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user-manager',
    name: 'Sofía Valenzuela (Manager)',
    email: 'manager@mitienda.com',
    role: 'MANAGER',
    active: true,
    phone: '+34 622 334 455',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-05T09:30:00.000Z',
    updatedAt: '2026-01-05T09:30:00.000Z',
  },
  {
    id: 'user-customer-1',
    name: 'Javier Alban (Cliente)',
    email: 'jalban.dacompsc@gmail.com',
    role: 'CUSTOMER',
    active: true,
    phone: '+34 633 445 566',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T14:15:00.000Z',
    updatedAt: '2026-01-10T14:15:00.000Z',
  },
  {
    id: 'user-customer-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    role: 'CUSTOMER',
    active: true,
    phone: '+34 644 556 677',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-12T16:00:00.000Z',
    updatedAt: '2026-01-12T16:00:00.000Z',
  },
  {
    id: 'user-customer-3',
    name: 'Mateo Morales',
    email: 'mateo.m@example.com',
    role: 'CUSTOMER',
    active: false,
    phone: '+34 655 667 788',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-14T11:20:00.000Z',
    updatedAt: '2026-01-14T11:20:00.000Z',
  },
];

export const initialOrders: Order[] = [
  {
    id: 'ORD-2026-001',
    customerId: 'user-customer-1',
    customerName: 'Javier Alban',
    customerEmail: 'jalban.dacompsc@gmail.com',
    items: [
      {
        productId: 'prod-1',
        productName: 'Audífonos Noise-Cancelling Pro Apex',
        productPrice: 249.99,
        quantity: 1,
        subtotal: 249.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-4',
        productName: 'Cargador Rápido GaN 100W 4-Puertos',
        productPrice: 59.99,
        quantity: 1,
        subtotal: 59.99,
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      },
    ],
    total: 309.98,
    status: 'DELIVERED',
    shippingAddress: 'Gran Vía 45, 4º B, 28013 Madrid, España',
    paymentMethod: 'Tarjeta de Crédito (Stripe / Firebase Pay)',
    notes: 'Por favor dejar en conserjería si no contesta.',
    createdAt: '2026-02-15T14:22:00.000Z',
    updatedAt: '2026-02-18T10:15:00.000Z',
  },
  {
    id: 'ORD-2026-002',
    customerId: 'user-customer-2',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    items: [
      {
        productId: 'prod-8',
        productName: 'Cafetera Espresso Manual Barista Precision',
        productPrice: 450.00,
        quantity: 1,
        subtotal: 450.00,
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-10',
        productName: 'Café Geisha Especialidad Finca El Mirador',
        productPrice: 26.50,
        quantity: 2,
        subtotal: 53.00,
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
      },
    ],
    total: 503.00,
    status: 'SHIPPED',
    shippingAddress: 'Passeig de Gràcia 88, 08008 Barcelona, España',
    paymentMethod: 'Google Pay',
    notes: 'Entregar en horario de oficina.',
    createdAt: '2026-02-28T09:10:00.000Z',
    updatedAt: '2026-03-01T15:30:00.000Z',
  },
  {
    id: 'ORD-2026-003',
    customerId: 'user-customer-1',
    customerName: 'Javier Alban',
    customerEmail: 'jalban.dacompsc@gmail.com',
    items: [
      {
        productId: 'prod-2',
        productName: 'Teclado Mecánico Wireless Tactile 75%',
        productPrice: 139.50,
        quantity: 1,
        subtotal: 139.50,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-6',
        productName: 'Lámpara de Escritorio Minimalista Halo',
        productPrice: 84.50,
        quantity: 1,
        subtotal: 84.50,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
      },
    ],
    total: 224.00,
    status: 'PROCESSING',
    shippingAddress: 'Calle Alcalá 120, 28009 Madrid, España',
    paymentMethod: 'Tarjeta de Débito',
    notes: '',
    createdAt: '2026-03-02T16:45:00.000Z',
    updatedAt: '2026-03-02T17:00:00.000Z',
  },
  {
    id: 'ORD-2026-004',
    customerId: 'user-customer-3',
    customerName: 'Mateo Morales',
    customerEmail: 'mateo.m@example.com',
    items: [
      {
        productId: 'prod-11',
        productName: 'Mochila Commuter Impermeable de Cordura',
        productPrice: 115.00,
        quantity: 1,
        subtotal: 115.00,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      },
    ],
    total: 115.00,
    status: 'PENDING',
    shippingAddress: 'Avenida Diagonal 300, 08013 Barcelona, España',
    paymentMethod: 'Transferencia Bancaria',
    notes: 'A la espera de confirmación bancaria',
    createdAt: '2026-03-03T11:15:00.000Z',
    updatedAt: '2026-03-03T11:15:00.000Z',
  },
];

class MemoryStore {
  private data: DataStore = {
    users: [...initialUsers],
    categories: [...initialCategories],
    products: [...initialProducts],
    orders: [...initialOrders],
  };

  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): User {
    this.data.users.unshift(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    return true;
  }

  // Categories
  getCategories(): Category[] {
    // Recalculate product counts
    return this.data.categories.map(cat => ({
      ...cat,
      productCount: this.data.products.filter(p => p.categoryId === cat.id).length,
    }));
  }

  getCategoryById(id: string): Category | undefined {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return undefined;
    return {
      ...cat,
      productCount: this.data.products.filter(p => p.categoryId === cat.id).length,
    };
  }

  addCategory(category: Category): Category {
    this.data.categories.push(category);
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates,
    };
    // Sync category name in products if updated
    if (updates.name) {
      this.data.products.forEach(p => {
        if (p.categoryId === id) {
          p.categoryName = updates.name;
        }
      });
    }
    return this.getCategoryById(id);
  }

  deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    return true;
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(product: Product): Product {
    const category = this.data.categories.find(c => c.id === product.categoryId);
    product.categoryName = category ? category.name : 'General';
    this.data.products.unshift(product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    if (updates.categoryId) {
      const category = this.data.categories.find(c => c.id === updates.categoryId);
      if (category) {
        updates.categoryName = category.name;
      }
    }
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    return true;
  }

  // Orders
  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  addOrder(order: Order): Order {
    // Reduce stock for products
    for (const item of order.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    this.data.orders.unshift(order);
    return order;
  }

  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return undefined;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  // Reset to seed
  resetData(): void {
    this.data = {
      users: [...initialUsers],
      categories: [...initialCategories],
      products: [...initialProducts],
      orders: [...initialOrders],
    };
  }
}

export const store = new MemoryStore();
