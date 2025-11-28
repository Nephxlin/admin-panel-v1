'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getImageUrl, getImageUrlWithCache } from '@/lib/image-utils';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  RefreshCw,
  Image as ImageIcon,
  X,
  Pencil,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Game {
  id: number;
  gameName: string;
  gameCode: string;
  cover: string | null;
  providerId: number;
  provider?: { name: string };
  gameType: string;
  rtp: number;
  views: number;
  status: number;
}

interface GameFormData {
  gameName: string;
  cover: string;
  rtp: number;
  status: number;
}

export default function GamesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [providerId, setProviderId] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<GameFormData>({
    gameName: '',
    cover: '',
    rtp: 95,
    status: 1,
  });
  const queryClient = useQueryClient();

  // Query para listar jogos
  const { data, isLoading } = useQuery({
    queryKey: ['games', page, search, providerId, statusFilter],
    queryFn: async () => {
      const response = await adminApi.games.list(
        page,
        20,
        search,
        providerId,
        statusFilter
      );
      return response.data.data;
    },
  });

  // Query para listar providers
  const { data: providersData } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await adminApi.providers.list(1, 100);
      return response.data.data;
    },
  });

  // Mutation para sincronizar jogos PGSoft
  const syncPGSoftMutation = useMutation({
    mutationFn: () => adminApi.games.syncPGSoft(),
    onMutate: () => {
      setIsSyncing(true);
      toast.loading('Sincronizando jogos PGSoft...', { id: 'sync-pgsoft' });
    },
    onSuccess: (response) => {
      const data = response.data.data;
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success(
        `Sincronização concluída! ${data.created} jogos criados, ${data.existing} já existiam`,
        { id: 'sync-pgsoft' }
      );
      setIsSyncing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao sincronizar jogos', {
        id: 'sync-pgsoft',
      });
      setIsSyncing(false);
    },
  });

  // Mutation para toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminApi.games.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Status do jogo atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status do jogo');
    },
  });

  // Mutation para deletar jogo
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.games.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Jogo deletado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao deletar jogo');
    },
  });

  // Mutation para atualizar jogo
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GameFormData }) =>
      adminApi.games.update(id, data),
    onSuccess: () => {
      toast.success('Jogo atualizado com sucesso!');
      // Forçar recarga dos dados
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.refetchQueries({ queryKey: ['games'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar jogo');
    },
  });

  const handleToggleStatus = (id: number) => {
    if (confirm('Deseja alterar o status deste jogo?')) {
      toggleStatusMutation.mutate(id);
    }
  };

  const handleDelete = (id: number, gameName: string) => {
    if (confirm(`Deseja realmente deletar o jogo "${gameName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);

        try {
          console.log('🖼️ Iniciando upload de imagem...');
          console.log('🔑 Token no localStorage:', !!localStorage.getItem('admin_token'));
          
          const response = await adminApi.games.uploadCover(base64);
          const imagePath = response.data.data.path;

          console.log('✅ Upload bem-sucedido:', imagePath);
          setFormData({ ...formData, cover: imagePath });
          toast.success('Imagem enviada com sucesso!');
        } catch (error: any) {
          console.error('❌ Erro no upload:', error);
          console.error('❌ Resposta do erro:', error.response?.data);
          toast.error(error.response?.data?.error || 'Erro ao enviar imagem');
          setImagePreview('');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error('Erro ao ler o arquivo');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      toast.error('Erro ao processar a imagem');
      setIsUploading(false);
    }
  };

  // Abrir modal para editar
  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData({
      gameName: game.gameName,
      cover: game.cover || '',
      rtp: game.rtp,
      status: game.status,
    });
    setImagePreview(
      game.cover ? getImageUrl(game.cover) : ''
    );
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGame(null);
    setFormData({
      gameName: '',
      cover: '',
      rtp: 95,
      status: 1,
    });
    setImagePreview('');
  };

  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gameName.trim()) {
      toast.error('O nome do jogo é obrigatório');
      return;
    }

    if (editingGame) {
      updateMutation.mutate({ id: editingGame.id, data: formData });
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row: any) => <span className="font-mono">#{row.id}</span>,
    },
    {
      key: 'cover',
      label: 'Capa',
      render: (row: any) => {
        // Usar updatedAt como cache buster se disponível, senão usar id
        const cacheBuster = row.updatedAt 
          ? new Date(row.updatedAt).getTime() 
          : row.id;
        
        return (
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden flex items-center justify-center">
            {row.cover ? (
              <img
                src={getImageUrlWithCache(row.cover, cacheBuster)}
                alt={row.gameName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Prevenir loop infinito removendo o src
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        );
      },
    },
    {
      key: 'gameName',
      label: 'Nome',
      render: (row: any) => (
        <div>
          <div className="font-semibold">{row.gameName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Código: {row.gameCode}
          </div>
        </div>
      ),
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (row: any) => (
        <span className="text-sm">{row.provider?.name || 'N/A'}</span>
      ),
    },
    {
      key: 'gameType',
      label: 'Tipo',
      render: (row: any) => (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
          {row.gameType || 'slot'}
        </span>
      ),
    },
    {
      key: 'rtp',
      label: 'RTP',
      render: (row: any) => <span className="text-sm">{row.rtp || 95}%</span>,
    },
    {
      key: 'views',
      label: 'Views',
      render: (row: any) => (
        <span className="text-sm">{row.views.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
            title={row.status === 1 ? 'Desativar' : 'Ativar'}
          >
            {row.status === 1 ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(row.id, row.gameName)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gerenciar Jogos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sincronize e gerencie jogos disponíveis na plataforma
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar jogos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={providerId || ''}
            onChange={(e) => {
              setProviderId(e.target.value ? parseInt(e.target.value) : undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os Providers</option>
            {providersData?.items?.map((provider: any) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter !== undefined ? statusFilter : ''}
            onChange={(e) => {
              setStatusFilter(e.target.value ? parseInt(e.target.value) : undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os Status</option>
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>

          {/* Sync Button */}
          <button
            onClick={() => syncPGSoftMutation.mutate()}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar PGSoft'}
          </button>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando jogos...</p>
        </div>
      ) : data?.items?.length > 0 ? (
        <DataTable
          columns={columns}
          data={data.items}
          pagination={{
            page: data.page,
            limit: data.perPage,
            total: data.total,
            totalPages: data.totalPages,
          }}
          onPageChange={setPage}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum jogo encontrado. Clique em "Sincronizar PGSoft" para importar jogos.
          </p>
        </div>
      )}

      {/* Modal de Editar Jogo */}
      {isModalOpen && editingGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Jogo
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nome do Jogo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Jogo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.gameName}
                  onChange={(e) =>
                    setFormData({ ...formData, gameName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Digite o nome do jogo"
                  required
                />
              </div>

              {/* RTP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RTP (%)
                </label>
                <input
                  type="number"
                  value={formData.rtp}
                  onChange={(e) =>
                    setFormData({ ...formData, rtp: parseFloat(e.target.value) })
                  }
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Upload de Capa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capa do Jogo
                </label>

                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, cover: '' });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-purple-600 hover:text-purple-700 font-medium">
                        Clique para fazer upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      PNG, JPG, GIF até 5MB
                    </p>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-2 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Enviando imagem...
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status === 1}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.checked ? 1 : 0 })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Jogo ativo
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || isUploading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
