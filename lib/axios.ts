import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// Criar instância do axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar interceptor de request GLOBALMENTE
apiClient.interceptors.request.use(
  (config) => {
    // Buscar token do localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      
      if (token) {
        // Garantir que headers existe
        if (!config.headers) {
          config.headers = {} as any;
        }
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 [Global Interceptor] Token adicionado:', config.url);
      } else {
        console.log('⚠️ [Global Interceptor] Nenhum token encontrado');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [Global Interceptor] Erro:', error);
    return Promise.reject(error);
  }
);

// Configurar interceptor de response GLOBALMENTE
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚫 [Global Interceptor] Erro 401 detectado');
      
      if (typeof window !== 'undefined') {
        const hasToken = !!localStorage.getItem('admin_token');
        
        if (hasToken) {
          // Só faz logout se havia um token (evita loops)
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

