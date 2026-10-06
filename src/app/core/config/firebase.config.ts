import { environment } from '../../../environments/environment';

export const firebaseConfig = environment.firebase;

export const FIREBASE_CONFIG = {
  ...firebaseConfig,
  collections: {
    users: 'users',
    products: 'products',
    categories: 'categories',
    orders: 'orders',
  },
  roles: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    CUSTOMER: 'CUSTOMER',
  },
};
