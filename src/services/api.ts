import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  
  const adminSessionStr = typeof window !== 'undefined' 
    ? (sessionStorage.getItem('premium_auth_admin_session') || localStorage.getItem('premium_auth_admin_session'))
    : null;
  const customerSessionStr = typeof window !== 'undefined'
    ? localStorage.getItem('premium_auth_customer_session')
    : null;
  
  let token = null;

  try {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    
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
    // console.error("Erro ao ler token", e);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
