import { apiClient } from './axios';

export const adminApi = {
  // ============================================
  // AUTH
  // ============================================
  auth: {
    me: () => apiClient.get('/api/auth/me'),
    logout: () => apiClient.post('/api/auth/logout'),
  },

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: {
    getStats: () => apiClient.get('/api/admin/dashboard/stats'),
    getTransactions: (page?: number, limit?: number) =>
      apiClient.get('/api/admin/dashboard/transactions', { params: { page, limit } }),
    getRevenueChart: (days?: number) =>
      apiClient.get('/api/admin/dashboard/revenue-chart', { params: { days } }),
    getCanceledTransactions: (days?: number) =>
      apiClient.get('/api/admin/dashboard/canceled-transactions', { params: { days } }),
  },

  // ============================================
  // USERS
  // ============================================
  users: {
    list: (page?: number, limit?: number, search?: string) =>
      apiClient.get('/api/admin/users', { params: { page, limit, search } }),
    get: (id: number) => apiClient.get(`/api/admin/users/${id}`),
    update: (id: number, data: any) => apiClient.put(`/api/admin/users/${id}`, data),
    toggleBan: (id: number) => apiClient.post(`/api/admin/users/${id}/toggle-ban`),
    adjustWallet: (id: number, data: any) =>
      apiClient.post(`/api/admin/users/${id}/adjust-wallet`, data),
  },

  // ============================================
  // DEPOSITS
  // ============================================
  deposits: {
    list: (page?: number, limit?: number, status?: number, userId?: number) =>
      apiClient.get('/api/admin/deposits', { params: { page, limit, status, userId } }),
    getStats: () => apiClient.get('/api/admin/deposits/stats'),
    approve: (id: number) => apiClient.post(`/api/admin/deposits/${id}/approve`),
    reject: (id: number) => apiClient.post(`/api/admin/deposits/${id}/reject`),
  },

  // ============================================
  // WITHDRAWALS
  // ============================================
  withdrawals: {
    list: (page?: number, limit?: number, status?: number, userId?: number) =>
      apiClient.get('/api/admin/withdrawals', {
        params: { page, limit, status, userId },
      }),
    getStats: () => apiClient.get('/api/admin/withdrawals/stats'),
    approve: (id: number, proof?: string) =>
      apiClient.post(`/api/admin/withdrawals/${id}/approve`, { proof }),
    reject: (id: number) => apiClient.post(`/api/admin/withdrawals/${id}/reject`),
  },

  // ============================================
  // GAMES
  // ============================================
  games: {
    list: (
      page?: number,
      limit?: number,
      search?: string,
      providerId?: number,
      status?: number
    ) =>
      apiClient.get('/api/admin/games', {
        params: { page, limit, search, providerId, status },
      }),
    get: (id: number) => apiClient.get(`/api/admin/games/${id}`),
    create: (data: any) => apiClient.post('/api/admin/games', data),
    update: (id: number, data: any) => {
      // Adicionar token manualmente para garantir
      const token = localStorage.getItem('admin_token');
      console.log('🔄 update - Token encontrado?', !!token);
      return apiClient.put(`/api/admin/games/${id}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    },
    delete: (id: number) => apiClient.delete(`/api/admin/games/${id}`),
    toggleStatus: (id: number) =>
      apiClient.post(`/api/admin/games/${id}/toggle-status`),
    // PGSoft sync
    uploadCover: (image: string) => {
      // Adicionar token manualmente para garantir
      const token = localStorage.getItem('admin_token');
      console.log('📤 uploadCover - Token encontrado?', !!token);
      return apiClient.post('/api/admin/games/upload-cover', { image }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    },
    syncPGSoft: () => apiClient.post('/api/admin/games/pgsoft/sync'),
    listAvailablePGSoft: () => apiClient.get('/api/admin/games/pgsoft/available'),
  },

  // ============================================
  // PROVIDERS
  // ============================================
  providers: {
    list: (page?: number, limit?: number) =>
      apiClient.get('/api/admin/providers', { params: { page, limit } }),
    get: (id: number) => apiClient.get(`/api/admin/providers/${id}`),
    create: (data: any) => apiClient.post('/api/admin/providers', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/providers/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/providers/${id}`),
  },

  // ============================================
  // CATEGORIES
  // ============================================
  categories: {
    list: (page?: number, limit?: number) =>
      apiClient.get('/api/admin/categories', { params: { page, limit } }),
    get: (id: number) => apiClient.get(`/api/admin/categories/${id}`),
    create: (data: any) => apiClient.post('/api/admin/categories', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/categories/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/categories/${id}`),
    // Gerenciamento de jogos
    addGames: (id: number, gameIds: number[]) =>
      apiClient.post(`/api/admin/categories/${id}/games`, { gameIds }),
    removeGame: (id: number, gameId: number) =>
      apiClient.delete(`/api/admin/categories/${id}/games/${gameId}`),
    getGames: (id: number) =>
      apiClient.get(`/api/admin/categories/${id}/games`),
    reorderGames: (id: number, gameIds: number[]) =>
      apiClient.put(`/api/admin/categories/${id}/games/reorder`, { gameIds }),
  },

  // ============================================
  // MISSIONS
  // ============================================
  missions: {
    list: (page?: number, limit?: number) =>
      apiClient.get('/api/admin/missions', { params: { page, limit } }),
    get: (id: number) => apiClient.get(`/api/admin/missions/${id}`),
    create: (data: any) => apiClient.post('/api/admin/missions', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/missions/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/missions/${id}`),
  },

  // ============================================
  // VIPS
  // ============================================
  vips: {
    list: () => apiClient.get('/api/admin/vips'),
    get: (id: number) => apiClient.get(`/api/admin/vips/${id}`),
    create: (data: any) => apiClient.post('/api/admin/vips', data),
    update: (id: number, data: any) => apiClient.put(`/api/admin/vips/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/vips/${id}`),
  },

  // ============================================
  // SETTINGS
  // ============================================
  settings: {
    get: () => apiClient.get('/api/admin/settings'),
    update: (data: any) => apiClient.put('/api/admin/settings', data),
    getGamesKeys: () => apiClient.get('/api/admin/settings/games-keys'),
    updateGamesKeys: (data: any) =>
      apiClient.put('/api/admin/settings/games-keys', data),
  },

  // ============================================
  // GATEWAYS
  // ============================================
  gateways: {
    list: () => apiClient.get('/api/admin/gateways'),
    create: (data: any) => apiClient.post('/api/admin/gateways', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/gateways/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/gateways/${id}`),
  },

  // ============================================
  // BANNERS
  // ============================================
  banners: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get('/api/admin/banners', { params }),
    get: (id: number) => apiClient.get(`/api/admin/banners/${id}`),
    create: (data: any) => apiClient.post('/api/admin/banners', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/banners/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/banners/${id}`),
    toggleStatus: (id: number) =>
      apiClient.post(`/api/admin/banners/${id}/toggle-status`),
    uploadImage: (image: string) => {
      // Adicionar token manualmente para garantir
      const token = localStorage.getItem('admin_token');
      return apiClient.post('/api/admin/banners/upload-image', { image }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    },
  },

  // ============================================
  // KWAI PIXELS
  // ============================================
  kwaiPixels: {
    list: () => apiClient.get('/api/admin/kwai-pixels'),
    listActive: () => apiClient.get('/api/admin/kwai-pixels/active'),
    get: (id: number) => apiClient.get(`/api/admin/kwai-pixels/${id}`),
    create: (data: any) => apiClient.post('/api/admin/kwai-pixels', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/kwai-pixels/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/kwai-pixels/${id}`),
    toggleStatus: (id: number, isActive: boolean) =>
      apiClient.post(`/api/admin/kwai-pixels/${id}/toggle-status`, { isActive }),
  },

  // ============================================
  // PGSOFT AGENTS
  // ============================================
  pgsoftAgents: {
    list: () => apiClient.get('/api/admin/pgsoft/agents'),
    get: (id: number) => apiClient.get(`/api/admin/pgsoft/agents/${id}`),
    create: (data: any) => apiClient.post('/api/admin/pgsoft/agents', data),
    update: (id: number, data: any) =>
      apiClient.put(`/api/admin/pgsoft/agents/${id}`, data),
    delete: (id: number) => apiClient.delete(`/api/admin/pgsoft/agents/${id}`),
  },
};

export default apiClient;

