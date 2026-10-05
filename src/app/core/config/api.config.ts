export const API_CONFIG = {
  baseUrl: '/api',
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      forgotPassword: '/api/auth/forgot-password',
      me: '/api/auth/me',
    },
    products: '/api/products',
    categories: '/api/categories',
    users: '/api/users',
    orders: '/api/orders',
    dashboard: '/api/dashboard',
    architecture: '/api/architecture/status',
    resetData: '/api/architecture/reset-data',
  },
};
