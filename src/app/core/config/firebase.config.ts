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
  endpoints: {
    products: `${environment.apiUrl}/products`,
    categories: `${environment.apiUrl}/categories`,
    users: `${environment.apiUrl}/users`,
    orders: `${environment.apiUrl}/orders`,
  },
  roles: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    CUSTOMER: 'CUSTOMER',
  },
};
