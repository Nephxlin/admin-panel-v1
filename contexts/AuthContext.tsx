'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Nota: Interceptores agora estão configurados globalmente em lib/axios.ts

  // Inicializar autenticação ao carregar a página
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = () => {
    console.log('🔄 Inicializando autenticação...');
    
    try {
      const storedToken = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');

      console.log('📦 Token no localStorage?', !!storedToken);
      console.log('📦 User no localStorage?', !!storedUser);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        console.log('👤 Usuário recuperado:', parsedUser.email);
        console.log('🔑 É admin?', parsedUser.isAdmin);
        
        // Verificar se é admin
        if (parsedUser.isAdmin) {
          setToken(storedToken);
          setUser(parsedUser);
          console.log('✅ Autenticação restaurada com sucesso');
        } else {
          console.log('⚠️ Usuário não é admin, limpando auth');
          clearAuth();
        }
      } else {
        console.log('ℹ️ Nenhum token/usuário encontrado no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar autenticação:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
      console.log('✅ Inicialização concluída');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔑 Iniciando login...');
      
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      const { accessToken, user: newUser } = response.data.data;
      
      console.log('✅ Login bem-sucedido, token recebido:', accessToken ? 'SIM' : 'NÃO');
      console.log('👤 Usuário:', newUser);
      console.log('🔑 Token:', accessToken?.substring(0, 20) + '...');

      // Verificar se é admin
      if (!newUser.isAdmin) {
        throw new Error('Você não tem permissão de administrador');
      }

      // Salvar no estado e localStorage
      setToken(accessToken);
      setUser(newUser);
      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('admin_user', JSON.stringify(newUser));
      
      console.log('💾 Token salvo no localStorage');
      console.log('🔍 Verificando token salvo:', localStorage.getItem('admin_token')?.substring(0, 20) + '...');

      // Salvar cookie
      document.cookie = `admin_token=${accessToken}; path=/; max-age=2592000; SameSite=Lax`;

      // Redirecionar para dashboard
      console.log('🚀 Redirecionando para /dashboard');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao fazer login. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    document.cookie = 'admin_token=; path=/; max-age=0';
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

