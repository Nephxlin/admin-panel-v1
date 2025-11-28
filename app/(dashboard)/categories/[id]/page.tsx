'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, X, Search, Loader2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/axios'
import toast from 'react-hot-toast'

interface Game {
  id: number
  name: string
  gameName?: string
  code: string
  gameCode?: string
  cover: string | null
  provider: string | { id: number; name: string; code: string }
  status: number
}

interface CategoryGame extends Game {
  gameId?: number
}

interface Category {
  id: number
  name: string
  description: string | null
}

export default function CategoryGamesPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = parseInt(params.id as string)

  const [category, setCategory] = useState<Category | null>(null)
  const [categoryGames, setCategoryGames] = useState<Game[]>([])
  const [allGames, setAllGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGames, setSelectedGames] = useState<number[]>([])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadCategory()
    loadCategoryGames()
    loadAllGames()
  }, [categoryId])

  const loadCategory = async () => {
    try {
      const response = await apiClient.get(`/api/admin/categories/${categoryId}`)
      if (response.data.status) {
        setCategory(response.data.data)
      }
    } catch (error: any) {
      console.error('Erro ao carregar categoria:', error)
      toast.error('Erro ao carregar categoria')
      router.push('/categories')
    }
  }

  const loadCategoryGames = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/admin/categories/${categoryId}/games`)
      if (response.data.status) {
        setCategoryGames(response.data.data.games || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar jogos da categoria:', error)
      toast.error('Erro ao carregar jogos da categoria')
      setCategoryGames([]) // Fallback para array vazio
    } finally {
      setLoading(false)
    }
  }

  const loadAllGames = async () => {
    try {
      const response = await apiClient.get('/api/admin/games?limit=1000')
      if (response.data.status) {
        // API retorna 'items', não 'games'
        // Normalizar os dados para ter campos consistentes
        const games = (response.data.data.items || []).map((game: any) => ({
          id: game.id,
          name: game.gameName || game.name,
          code: game.gameCode || game.code,
          cover: game.cover,
          provider: typeof game.provider === 'string' ? game.provider : game.provider?.name || '',
          status: game.status,
        }))
        setAllGames(games)
      }
    } catch (error: any) {
      console.error('Erro ao carregar todos os jogos:', error)
      setAllGames([]) // Fallback para array vazio
    }
  }

  const handleAddGames = async () => {
    if (selectedGames.length === 0) {
      toast.error('Selecione pelo menos um jogo')
      return
    }

    try {
      setAdding(true)
      const response = await apiClient.post(`/api/admin/categories/${categoryId}/games`, {
        gameIds: selectedGames,
      })
      if (response.data.status) {
        toast.success(response.data.message)
        setShowAddModal(false)
        setSelectedGames([])
        setSearchQuery('')
        loadCategoryGames()
      }
    } catch (error: any) {
      console.error('Erro ao vincular jogos:', error)
      toast.error(error.response?.data?.message || 'Erro ao vincular jogos')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveGame = async (gameId: number) => {
    if (!confirm('Deseja remover este jogo da categoria?')) {
      return
    }

    try {
      const response = await apiClient.delete(`/api/admin/categories/${categoryId}/games/${gameId}`)
      if (response.data.status) {
        toast.success('Jogo removido da categoria')
        loadCategoryGames()
      }
    } catch (error: any) {
      console.error('Erro ao remover jogo:', error)
      toast.error(error.response?.data?.message || 'Erro ao remover jogo')
    }
  }

  const toggleGameSelection = (gameId: number) => {
    setSelectedGames((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    )
  }

  // Filtrar jogos disponíveis (que não estão na categoria)
  const availableGames = (allGames || [])
    .filter((game) => game && game.id)
    .filter((game) => !categoryGames.some((cg) => cg.id === game.id))
    .filter((game) => game.name && game.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/categories')}
          className="text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            {category?.name || 'Categoria'}
          </h1>
          <p className="text-gray-400 mt-1">
            {categoryGames.length} jogo(s) vinculado(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Adicionar Jogos
        </button>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Carregando...</div>
      ) : categoryGames.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>Nenhum jogo vinculado a esta categoria</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-purple-400 hover:text-purple-300 transition"
          >
            Adicionar jogos agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categoryGames.map((game) => (
            <div
              key={game.id}
              className="relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden group hover:border-purple-500 transition"
            >
              <div className="aspect-[3/4] relative">
                {game.cover ? (
                  <img
                    src={game.cover}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Sem imagem</span>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveGame(game.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-2">
                <p className="text-white text-sm font-medium truncate">{game.name}</p>
                <p className="text-gray-400 text-xs truncate">
                  {typeof game.provider === 'string' ? game.provider : game.provider.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Games Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Adicionar Jogos</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedGames([])
                  setSearchQuery('')
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar jogos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Selected Count */}
            <div className="mb-4 text-sm text-gray-400">
              {selectedGames.length} jogo(s) selecionado(s)
            </div>

            {/* Games Grid */}
            <div className="flex-1 overflow-y-auto mb-4">
              {availableGames.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  {searchQuery
                    ? 'Nenhum jogo encontrado'
                    : 'Todos os jogos já estão vinculados a esta categoria'}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => toggleGameSelection(game.id)}
                      className={`bg-gray-700 border-2 rounded-lg overflow-hidden cursor-pointer transition ${
                        selectedGames.includes(game.id)
                          ? 'border-purple-500'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="aspect-[3/4] relative">
                        {game.cover ? (
                          <img
                            src={game.cover}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Sem imagem</span>
                          </div>
                        )}
                        {selectedGames.includes(game.id) && (
                          <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {game.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {typeof game.provider === 'string' ? game.provider : game.provider.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedGames([])
                  setSearchQuery('')
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                disabled={adding}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGames}
                disabled={selectedGames.length === 0 || adding}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  `Adicionar ${selectedGames.length} jogo(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

