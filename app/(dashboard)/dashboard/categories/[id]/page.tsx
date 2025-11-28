'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Search, Trash2, GripVertical } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { API_URL } from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
}

interface Game {
  id: number;
  gameName: string;
  gameCode: string;
  cover: string | null;
  provider: {
    name: string;
  };
  order?: number;
}

// Componente para item arrast�vel
function SortableGameItem({ game, onRemove }: { game: Game; onRemove: (id: number, name: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cacheBuster = game.order || Date.now();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-700 rounded-lg p-4 transition group relative ${
        isDragging ? 'z-50 shadow-2xl' : ''
      }`}
    >
      {/* Handle para arrastar */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing p-1 bg-gray-600 rounded hover:bg-gray-500 transition z-20"
        title="Arrastar para reordenar"
      >
        <GripVertical size={16} className="text-gray-300" />
      </div>

      {/* Botão de Remover */}
      <button
        onClick={() => onRemove(game.id, game.gameName)}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition z-10 shadow-lg"
        title="Desvincular jogo"
      >
        <Trash2 size={16} />
      </button>

      {/* Imagem do Jogo */}
      <div className="w-full h-32 bg-gray-600 rounded-lg overflow-hidden mb-3">
        {game.cover ? (
          <img
            src={`${API_URL}/uploads/${game.cover}?v=${cacheBuster}`}
            alt={game.gameName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info do Jogo */}
      <div className="pl-6">
        <h3 className="text-white font-semibold truncate">{game.gameName}</h3>
        <p className="text-xs text-gray-400 mt-1">Código: {game.gameCode}</p>
        <p className="text-xs text-gray-500 mt-1">Provider: {game.provider?.name || 'N/A'}</p>
      </div>
    </div>
  );
}

export default function CategoryGamesPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);

  const [category, setCategory] = useState<Category | null>(null);
  const [linkedGames, setLinkedGames] = useState<Game[]>([]);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState<number[]>([]);

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar categoria
      const categoryResponse = await apiClient.get(`/api/admin/categories/${categoryId}`);
      if (categoryResponse.data.status) {
        setCategory(categoryResponse.data.data);
      }

      // Carregar jogos vinculados
      const linkedResponse = await apiClient.get(`/api/admin/categories/${categoryId}/games`);
      if (linkedResponse.data.status) {
        const games = linkedResponse.data.data.games || [];
        // Mapear para a estrutura esperada
        const mappedGames = games.map((game: any) => ({
          id: game.id,
          gameName: game.name || game.gameName,
          gameCode: game.code || game.gameCode,
          cover: game.cover,
          provider: {
            name: typeof game.provider === 'string' ? game.provider : game.provider?.name
          }
        }));
        setLinkedGames(mappedGames);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da categoria');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGames = async () => {
    try {
      // Carregar todos os jogos
      const response = await apiClient.get('/api/admin/games', {
        params: { page: 1, limit: 1000 }
      });
      
      if (response.data.status) {
        const allGames = response.data.data.items || [];
        
        // Filtrar jogos que já não estão vinculados
        const linkedGameIds = linkedGames.map(g => g.id);
        const available = allGames.filter((game: Game) => !linkedGameIds.includes(game.id));
        
        setAvailableGames(available);
      }
    } catch (error: any) {
      console.error('Erro ao carregar jogos disponíveis:', error);
      toast.error('Erro ao carregar jogos disponíveis');
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSelectedGames([]);
    setSearchQuery('');
    loadAvailableGames();
  };

  const handleAddGames = async () => {
    if (selectedGames.length === 0) {
      toast.error('Selecione pelo menos um jogo');
      return;
    }

    try {
      const response = await apiClient.post(`/api/admin/categories/${categoryId}/games`, {
        gameIds: selectedGames
      });

      if (response.data.status) {
        toast.success(`${selectedGames.length} jogo(s) vinculado(s) com sucesso!`);
        setShowAddModal(false);
        setSelectedGames([]);
        loadData();
      }
    } catch (error: any) {
      console.error('Erro ao vincular jogos:', error);
      toast.error(error.response?.data?.error || 'Erro ao vincular jogos');
    }
  };

  const handleRemoveGame = async (gameId: number, gameName: string) => {
    if (!confirm(`Deseja realmente desvincular o jogo "${gameName}" desta categoria?`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/admin/categories/${categoryId}/games/${gameId}`);
      
      if (response.data.status) {
        toast.success('Jogo desvinculado com sucesso!');
        loadData();
      }
    } catch (error: any) {
      console.error('Erro ao desvincular jogo:', error);
      toast.error(error.response?.data?.error || 'Erro ao desvincular jogo');
    }
  };

  const toggleGameSelection = (gameId: number) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = linkedGames.findIndex((game) => game.id === active.id);
    const newIndex = linkedGames.findIndex((game) => game.id === over.id);

    const newOrder = arrayMove(linkedGames, oldIndex, newIndex);
    setLinkedGames(newOrder);

    // Salvar nova ordem no backend
    try {
      const gameIds = newOrder.map((game) => game.id);
      await apiClient.put(`/api/admin/categories/${categoryId}/games/reorder`, { gameIds });
      toast.success('Ordem atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error('Erro ao atualizar ordem dos jogos');
      // Reverter ordem em caso de erro
      loadData();
    }
  };

  const filteredAvailableGames = availableGames.filter(game =>
    game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.gameCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-500">Categoria não encontrada</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            {category.description && (
              <p className="text-gray-400 mt-2">{category.description}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {linkedGames.length} jogo(s) vinculado(s)
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Adicionar Jogos
          </button>
        </div>
      </div>

      {/* Jogos Vinculados */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Jogos Vinculados</h2>
          {linkedGames.length > 0 && (
            <p className="text-sm text-gray-400">
              <GripVertical size={16} className="inline mr-1" />
              Arraste para reordenar
            </p>
          )}
        </div>

        {linkedGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nenhum jogo vinculado a esta categoria</p>
            <button
              onClick={handleOpenAddModal}
              className="text-purple-500 hover:text-purple-400 transition"
            >
              Clique aqui para adicionar jogos
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={linkedGames.map((game) => game.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {linkedGames.map((game) => (
                  <SortableGameItem
                    key={game.id}
                    game={game}
                    onRemove={handleRemoveGame}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal de Adicionar Jogos */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Adicionar Jogos à Categoria</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Busca */}
            <div className="p-6 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar jogos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {selectedGames.length > 0 && (
                <div className="mt-3 text-sm text-gray-400">
                  {selectedGames.length} jogo(s) selecionado(s)
                </div>
              )}
            </div>

            {/* Lista de Jogos */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAvailableGames.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {searchQuery ? 'Nenhum jogo encontrado' : 'Todos os jogos já estão vinculados'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAvailableGames.map((game) => {
                    const isSelected = selectedGames.includes(game.id);
                    const cacheBuster = Date.now();
                    
                    return (
                      <div
                        key={game.id}
                        onClick={() => toggleGameSelection(game.id)}
                        className={`cursor-pointer rounded-lg p-4 transition ${
                          isSelected
                            ? 'bg-purple-600 border-2 border-purple-400'
                            : 'bg-gray-700 border-2 border-transparent hover:border-purple-500'
                        }`}
                      >
                        {/* Imagem */}
                        <div className="w-full h-24 bg-gray-600 rounded-lg overflow-hidden mb-3">
                          {game.cover ? (
                            <img
                              src={`${API_URL}/uploads/${game.cover}?v=${cacheBuster}`}
                              alt={game.gameName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="text-white font-semibold text-sm truncate">{game.gameName}</h3>
                          <p className="text-xs text-gray-300 mt-1">{game.provider?.name || 'N/A'}</p>
                        </div>

                        {/* Checkbox */}
                        {isSelected && (
                          <div className="mt-2 flex justify-center">
                            <div className="bg-white rounded-full p-1">
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGames}
                disabled={selectedGames.length === 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar {selectedGames.length > 0 && `(${selectedGames.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
