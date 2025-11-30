'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  Eye, 
  EyeOff, 
  Copy, 
  Check,
  Activity,
  Info,
  Link2,
  Hash,
  Tag,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface KwaiPixel {
  id: number
  pixelId: string
  accessToken?: string
  name?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function KwaiPixelsPage() {
  const [pixels, setPixels] = useState<KwaiPixel[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPixel, setEditingPixel] = useState<KwaiPixel | null>(null)
  const [showTokens, setShowTokens] = useState<{ [key: number]: boolean }>({})
  const [copiedId, setCopiedId] = useState<number | null>(null)
  
  // URL do frontend (de variável de ambiente ou padrão)
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3006'

  // Form state
  const [formData, setFormData] = useState({
    pixelId: '',
    accessToken: '',
    name: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    loadPixels()
  }, [])

  const loadPixels = async () => {
    try {
      setLoading(true)
      const response = await adminApi.kwaiPixels.list()
      setPixels(response.data.data || [])
    } catch (error: any) {
      console.error('Erro ao carregar pixels:', error)
      toast.error(error.response?.data?.message || 'Erro ao carregar pixels')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPixel) {
        await adminApi.kwaiPixels.update(editingPixel.id, formData)
        toast.success('Pixel atualizado com sucesso!')
      } else {
        await adminApi.kwaiPixels.create(formData)
        toast.success('Pixel criado com sucesso!')
      }

      setShowModal(false)
      setEditingPixel(null)
      resetForm()
      loadPixels()
    } catch (error: any) {
      console.error('Erro ao salvar pixel:', error)
      toast.error(error.response?.data?.message || 'Erro ao salvar pixel')
    }
  }

  const handleEdit = (pixel: KwaiPixel) => {
    setEditingPixel(pixel)
    setFormData({
      pixelId: pixel.pixelId,
      accessToken: pixel.accessToken || '',
      name: pixel.name || '',
      description: pixel.description || '',
      isActive: pixel.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este pixel?')) return

    try {
      await adminApi.kwaiPixels.delete(id)
      toast.success('Pixel deletado com sucesso!')
      loadPixels()
    } catch (error: any) {
      console.error('Erro ao deletar pixel:', error)
      toast.error(error.response?.data?.message || 'Erro ao deletar pixel')
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await adminApi.kwaiPixels.toggleStatus(id, !isActive)
      toast.success(`Pixel ${!isActive ? 'ativado' : 'desativado'} com sucesso!`)
      loadPixels()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      toast.error(error.response?.data?.message || 'Erro ao alterar status')
    }
  }

  const toggleShowToken = (id: number) => {
    setShowTokens((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Copiado!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  const resetForm = () => {
    setFormData({
      pixelId: '',
      accessToken: '',
      name: '',
      description: '',
      isActive: true,
    })
  }

  const openModal = () => {
    resetForm()
    setEditingPixel(null)
    setShowModal(true)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-500" />
              Kwai Pixels
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie pixels para rastreamento de conversão e campanhas Kwai
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Pixel
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                O que são Kwai Pixels?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Códigos de rastreamento do Kwai para medir conversões de anúncios e campanhas de marketing.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Como Usar
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Adicione <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded">?kpid=SEU_PIXEL</code> na URL do anúncio
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Status Ativo
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Apenas pixels ativos são rastreados no frontend e enviados ao Kwai
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando pixels...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && pixels.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum pixel cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crie seu primeiro pixel Kwai para começar a rastrear conversões
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Pixel
          </button>
        </div>
      )}

      {/* Pixels Grid */}
      {!loading && pixels.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pixels.map((pixel) => (
            <div
              key={pixel.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              {/* Header do Card */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pixel.name || 'Pixel sem nome'}
                      </h3>
                    </div>
                    {pixel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pixel.description}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <button
                    onClick={() => handleToggleStatus(pixel.id, pixel.isActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      pixel.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={pixel.isActive ? 'Clique para desativar' : 'Clique para ativar'}
                  >
                    {pixel.isActive ? (
                      <>
                        <Power size={12} />
                        Ativo
                      </>
                    ) : (
                      <>
                        <PowerOff size={12} />
                        Inativo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Body do Card */}
              <div className="p-6 space-y-4">
                {/* Pixel ID */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-purple-500" />
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Pixel ID
                    </label>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <code className="flex-1 text-sm font-mono text-purple-700 dark:text-purple-300 break-all">
                      {pixel.pixelId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(pixel.pixelId, pixel.id)}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded transition-colors"
                      title="Copiar Pixel ID"
                    >
                      {copiedId === pixel.id ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} className="text-purple-600 dark:text-purple-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Use na URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">?kpid={pixel.pixelId}</code>
                  </p>
                </div>

                {/* Access Token */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Access Token
                    </label>
                  </div>
                  {pixel.accessToken ? (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <code className="flex-1 text-sm font-mono text-blue-700 dark:text-blue-300 truncate">
                        {showTokens[pixel.id]
                          ? pixel.accessToken
                          : '••••••••••••••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleShowToken(pixel.id)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded transition-colors"
                        title={showTokens[pixel.id] ? 'Ocultar token' : 'Mostrar token'}
                      >
                        {showTokens[pixel.id] ? (
                          <EyeOff size={18} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Não configurado (rastreamento apenas client-side)
                      </span>
                    </div>
                  )}
                </div>

                {/* URL de Teste */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-green-500" />
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      URL de Teste
                    </label>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <code className="flex-1 text-xs font-mono text-green-700 dark:text-green-300 break-all">
                      {frontendUrl}?kpid={pixel.pixelId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(
                        `${frontendUrl}?kpid=${pixel.pixelId}`,
                        pixel.id + 1000
                      )}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-800/30 rounded transition-colors flex-shrink-0"
                      title="Copiar URL de teste"
                    >
                      {copiedId === pixel.id + 1000 ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-green-600 dark:text-green-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Cole esta URL no seu anúncio do Kwai para testar o rastreamento
                  </p>
                </div>

                {/* Data de criação */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3.5 h-3.5" />
                  Criado em: {new Date(pixel.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Footer do Card - Ações */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(pixel)}
                  className="flex items-center gap-1.5 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar pixel"
                >
                  <Edit size={16} />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(pixel.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Deletar pixel"
                >
                  <Trash2 size={16} />
                  <span className="text-sm font-medium">Deletar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPixel ? 'Editar Pixel Kwai' : 'Novo Pixel Kwai'}
                </h2>
              </div>

              {/* Info sobre o formulário */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">📊 Rastreamento de Conversão</p>
                    <p>Configure pixels para rastrear conversões de campanhas do Kwai Ads. O Pixel ID é obrigatório, o Access Token é opcional.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Pixel ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-500" />
                    Pixel ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pixelId}
                    onChange={(e) =>
                      setFormData({ ...formData, pixelId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0D0NElE9N8onlSxVmaAuGA"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ID do pixel obtido no Kwai Business Manager ou Kwai For Business
                  </p>
                </div>

                {/* Access Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Access Token <span className="text-gray-400 text-xs">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accessToken}
                    onChange={(e) =>
                      setFormData({ ...formData, accessToken: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Token para rastreamento server-side (opcional)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ⚠️ Necessário apenas para enviar eventos de conversão do servidor ao Kwai
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-500" />
                    Nome da Campanha
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Campanha Black Friday 2024"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Nome descritivo para identificar facilmente esta campanha
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Descreva o objetivo desta campanha e onde será usada..."
                  />
                </div>

                {/* Preview da URL */}
                {formData.pixelId && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <label className="text-xs font-semibold text-green-900 dark:text-green-100 uppercase tracking-wider">
                        Preview da URL de Teste
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-green-700 dark:text-green-300 break-all p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-600">
                        {frontendUrl}?kpid={formData.pixelId}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${frontendUrl}?kpid=${formData.pixelId}`, 9999)}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-800/30 rounded transition-colors flex-shrink-0"
                        title="Copiar URL"
                      >
                        {copiedId === 9999 ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} className="text-green-600 dark:text-green-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                      ✅ Cole esta URL nos seus anúncios do Kwai para rastrear conversões
                    </p>
                  </div>
                )}

                {/* Is Active */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Pixel ativo
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        ✅ Marcado: O pixel será rastreado no frontend<br />
                        ❌ Desmarcado: O pixel não será carregado (útil para pausar campanhas)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPixel(null)
                      resetForm()
                    }}
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
                  >
                    {editingPixel ? (
                      <>
                        <Edit className="w-4 h-4" />
                        Atualizar Pixel
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Pixel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


