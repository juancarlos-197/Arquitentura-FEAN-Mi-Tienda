export const firebaseConfig = {
  apiKey: 'AIzaSy_FEAN_MOCK_API_KEY_PLACEHOLDER',
  authDomain: 'mitienda-fean-enterprise.firebaseapp.com',
  projectId: 'mitienda-fean-enterprise',
  storageBucket: 'mitienda-fean-enterprise.appspot.com',
  messagingSenderId: '213182104623',
  appId: '1:213182104623:web:7f8a9b0c1d2e3f4a',
  measurementId: 'G-FEAN2026',
};

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
