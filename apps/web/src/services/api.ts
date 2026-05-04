import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const adminSessionStr = localStorage.getItem('premium_auth_admin_session');
  const customerSessionStr = localStorage.getItem('premium_auth_customer_session');
  
  let token = null;

  try {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    if (isAdminRoute && adminSessionStr) {
      const adminSession = JSON.parse(adminSessionStr);
      token = adminSession.tokens?.accessToken || adminSession.token || adminSession.tokenId;
    } else if (customerSessionStr) {
      const customerSession = JSON.parse(customerSessionStr);
      token = customerSession.tokens?.accessToken || customerSession.token || customerSession.tokenId;
    } else if (adminSessionStr) {
      const adminSession = JSON.parse(adminSessionStr);
      token = adminSession.tokens?.accessToken || adminSession.token || adminSession.tokenId;
    }
  } catch (e) {
    // console.error("Erro ao ler token do localStorage", e);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
