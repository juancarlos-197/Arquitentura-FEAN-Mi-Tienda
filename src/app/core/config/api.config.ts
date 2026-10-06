import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    auth: {
      login: `${environment.apiUrl}/auth/login`,
      register: `${environment.apiUrl}/auth/register`,
      forgotPassword: `${environment.apiUrl}/auth/forgot-password`,
      me: `${environment.apiUrl}/auth/me`,
    },
    products: `${environment.apiUrl}/products`,
    categories: `${environment.apiUrl}/categories`,
    users: `${environment.apiUrl}/users`,
    orders: `${environment.apiUrl}/orders`,
    dashboard: `${environment.apiUrl}/dashboard`,
    architecture: `${environment.apiUrl}/architecture/status`,
    resetData: `${environment.apiUrl}/architecture/reset-data`,
  },
};
