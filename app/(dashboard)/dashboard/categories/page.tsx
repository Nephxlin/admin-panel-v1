'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Link, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/axios'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
  description: string | null
  image: string | null
  slug: string
  _count?: {
    games: number
  }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    slug: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/admin/categories')
      if (response.data.status) {
        setCategories(response.data.data.categories)
      }
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error)
      toast.error(error.response?.data?.message || 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório')
      return
    }

    try {
      const response = await apiClient.post('/api/admin/categories', formData)
      if (response.data.status) {
        toast.success('Categoria criada com sucesso!')
        setShowCreateModal(false)
        setFormData({ name: '', description: '', image: '', slug: '' })
        loadCategories()
      }
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error)
      toast.error(error.response?.data?.message || 'Erro ao criar categoria')
    }
  }

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      slug: category.slug,
    })
    setShowEditModal(true)
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório')
      return
    }

    if (!editingCategory) return

    try {
      const response = await apiClient.put(`/api/admin/categories/${editingCategory.id}`, formData)
      if (response.data.status) {
        toast.success('Categoria atualizada com sucesso!')
        setShowEditModal(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '', image: '', slug: '' })
        loadCategories()
      }
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error)
      toast.error(error.response?.data?.error || 'Erro ao atualizar categoria')
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return
    }

    try {
      const response = await apiClient.delete(`/api/admin/categories/${categoryId}`)
      if (response.data.status) {
        toast.success('Categoria deletada com sucesso!')
        loadCategories()
      }
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error)
      toast.error(error.response?.data?.message || 'Erro ao deletar categoria')
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-gray-400 mt-1">Gerencie as categorias de jogos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Carregando...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          {searchQuery ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {category._count?.games || 0} jogo(s) vinculado(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/dashboard/categories/${category.id}`)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                >
                  <Link size={16} />
                  Vincular Jogos
                </button>
                <button
                  onClick={() => handleOpenEditModal(category)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition"
                  title="Editar categoria"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                  title="Deletar categoria"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Nova Categoria</h2>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: Slots, Cassino ao Vivo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Slug (opcional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: slots, cassino-ao-vivo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="Descrição da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', image: '', slug: '' })
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Editar Categoria</h2>

            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: Slots, Cassino ao Vivo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Slug (opcional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: slots, cassino-ao-vivo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="Descrição da categoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCategory(null)
                    setFormData({ name: '', description: '', image: '', slug: '' })
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Atualizar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

