'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';

interface Banner {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannerFormData {
  title: string;
  description: string;
  image: string;
  link: string;
  isActive: boolean;
}

export default function BannersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    image: '',
    link: '',
    isActive: true,
  });

  // Buscar banners
  const { data, isLoading } = useQuery({
    queryKey: ['banners', page],
    queryFn: async () => {
      const response = await adminApi.banners.list({ page, limit: 10 });
      return response.data.data;
    },
  });

  // Criar banner
  const createMutation = useMutation({
    mutationFn: (data: BannerFormData) => adminApi.banners.create(data),
    onSuccess: () => {
      toast.success('Banner criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar banner');
    },
  });

  // Atualizar banner
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BannerFormData }) =>
      adminApi.banners.update(id, data),
    onSuccess: () => {
      toast.success('Banner atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar banner');
    },
  });

  // Deletar banner
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.banners.delete(id),
    onSuccess: () => {
      toast.success('Banner deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao deletar banner');
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => adminApi.banners.toggleStatus(id),
    onSuccess: () => {
      toast.success('Status alterado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao alterar status');
    },
  });

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);

        try {
          const response = await adminApi.banners.uploadImage(base64);
          const imagePath = response.data.data.path;

          setFormData({ ...formData, image: imagePath });
          toast.success('Imagem enviada com sucesso!');
        } catch (error: any) {
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
      toast.error('Erro ao processar a imagem');
      setIsUploading(false);
    }
  };

  // Abrir modal para criar
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      isActive: true,
    });
    setImagePreview('');
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image: banner.image,
      link: banner.link || '',
      isActive: banner.isActive,
    });
    setImagePreview(getImageUrl(banner.image));
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      isActive: true,
    });
    setImagePreview('');
  };

  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (!formData.image) {
      toast.error('A imagem é obrigatória');
      return;
    }

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Deletar banner
  const handleDelete = (banner: Banner) => {
    if (
      window.confirm(`Tem certeza que deseja deletar o banner "${banner.title}"?`)
    ) {
      deleteMutation.mutate(banner.id);
    }
  };

  // Toggle status
  const handleToggleStatus = (banner: Banner) => {
    toggleStatusMutation.mutate(banner.id);
  };

  // Colunas da tabela
  const columns = [
    {
      key: 'image',
      label: 'Imagem',
      render: (row: Banner) => (
        <div className="relative w-24 h-16 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(row.image)}
            alt={row.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Título',
      render: (row: Banner) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.title}
          </div>
          {row.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'link',
      label: 'Link',
      render: (row: Banner) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block">
          {row.link || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: Banner) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {row.isActive ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row: Banner) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleStatus(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            title={row.isActive ? 'Desativar' : 'Ativar'}
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg"
            title="Editar"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            title="Deletar"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Banners
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os banners promocionais do site
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Banner
        </button>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando banners...
          </p>
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
            Nenhum banner encontrado. Clique em "Novo Banner" para criar.
          </p>
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
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
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Digite o título do banner"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Digite uma descrição (opcional)"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagem <span className="text-red-500">*</span>
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
                        setFormData({ ...formData, image: '' });
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
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Banner ativo
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
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    isUploading ||
                    !formData.image
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : editingBanner
                    ? 'Atualizar'
                    : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
