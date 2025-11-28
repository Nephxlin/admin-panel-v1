'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { Plus, Edit, Trash2, Power, PowerOff, Eye, EyeOff, Copy, Check } from 'lucide-react'
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kwai Pixels</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie os pixels Kwai para rastreamento de conversão
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Novo Pixel
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Como usar:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Crie pixels para diferentes campanhas no Kwai</li>
          <li>• Use o Pixel ID na URL: <code className="bg-blue-100 px-2 py-1 rounded">?kpid=SEU_PIXEL_ID</code></li>
          <li>• Access Token é opcional (apenas para rastreamento server-side)</li>
          <li>• Pixels inativos não aparecerão no frontend</li>
        </ul>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Carregando pixels...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && pixels.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nenhum pixel cadastrado ainda.</p>
          <button
            onClick={openModal}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Criar primeiro pixel
          </button>
        </div>
      )}

      {/* Pixels List */}
      {!loading && pixels.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pixel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pixel ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pixels.map((pixel) => (
                <tr key={pixel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pixel.name || 'Sem nome'}
                      </div>
                      {pixel.description && (
                        <div className="text-sm text-gray-500">{pixel.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {pixel.pixelId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(pixel.pixelId, pixel.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar Pixel ID"
                      >
                        {copiedId === pixel.id ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {pixel.accessToken ? (
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono max-w-[200px] truncate">
                          {showTokens[pixel.id]
                            ? pixel.accessToken
                            : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleShowToken(pixel.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title={showTokens[pixel.id] ? 'Ocultar' : 'Mostrar'}
                        >
                          {showTokens[pixel.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Não configurado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(pixel.id, pixel.isActive)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        pixel.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pixel.isActive ? (
                        <>
                          <Power size={14} />
                          Ativo
                        </>
                      ) : (
                        <>
                          <PowerOff size={14} />
                          Inativo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(pixel)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pixel.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPixel ? 'Editar Pixel' : 'Novo Pixel'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pixel ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pixel ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pixelId}
                    onChange={(e) =>
                      setFormData({ ...formData, pixelId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0D0NElE9N8onlSxVmaAuGA"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ID do pixel obtido no Kwai Business Manager
                  </p>
                </div>

                {/* Access Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.accessToken}
                    onChange={(e) =>
                      setFormData({ ...formData, accessToken: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deixe vazio se não for usar rastreamento server-side"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Necessário apenas para enviar eventos do servidor
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Campanha Principal"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Pixel para rastreamento da campanha principal..."
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Pixel ativo
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPixel(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPixel ? 'Atualizar' : 'Criar'} Pixel
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

