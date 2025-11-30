'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Server,
  Key,
  Activity,
  Info,
  Lock,
  Link2,
  Zap,
  TrendingUp,
  Award,
  Target,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

interface Agent {
  id: number;
  agentcode: string;
  agentToken: string;
  secretKey: string;
  callbackurl: string;
  saldo: number;
  probganho: number;
  probbonus: number;
  probganhortp: number;
  probganhoinfluencer: number;
  probbonusinfluencer: number;
  probganhoaposta: number;
  probganhosaldo: number;
  limitadorchicky: number;
  created_at: string;
}

export default function PGSoftAgentsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const queryClient = useQueryClient();

  // Query para listar agents
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['pgsoft-agents'],
    queryFn: async () => {
      const response = await adminApi.pgsoftAgents.list();
      return response.data;
    },
    retry: 1,
  });

  // Mutation para criar agent
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.pgsoftAgents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pgsoft-agents'] });
      toast.success('Agent criado com sucesso!');
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar agent');
    },
  });

  // Mutation para atualizar agent
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      adminApi.pgsoftAgents.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pgsoft-agents'] });
      toast.success('Agent atualizado com sucesso!');
      setEditingAgent(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar agent');
    },
  });

  // Mutation para deletar agent
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.pgsoftAgents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pgsoft-agents'] });
      toast.success('Agent deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao deletar agent'
      );
    },
  });

  const handleDelete = (id: number, agentcode: string) => {
    if (
      confirm(
        `⚠️ ATENÇÃO: Tem certeza que deseja deletar o agent "${agentcode}"?\n\n` +
        `Esta ação não pode ser desfeita.\n\n` +
        `IMPORTANTE: Se este agent tiver usuários associados, a exclusão falhará. ` +
        `Você precisará remover ou transferir os usuários primeiro.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const agents: Agent[] = agentsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando agents...
          </p>
        </div>
      </div>
    );
  }

  // Se houver erro de conexão
  if (agentsData?.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Erro de Conexão
              </h3>
              <p className="text-red-700 dark:text-red-200 mb-3">
                {agentsData.error}
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                Verifique se:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 mt-2 space-y-1">
                <li>A API PGSoft Node está rodando</li>
                <li>A URL está configurada corretamente nas Configurações</li>
                <li>Não há firewall bloqueando a conexão</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Server className="w-8 h-8" />
              Agents do Motor PGSoft
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie os operadores cadastrados no database.sqlite
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-5 h-5" />
            Novo Agent
          </button>
        </div>
      </div>

      {/* Cards Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: O que são Agents */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                O que são Agents?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Operadores cadastrados no motor de jogos SQLite que controlam autenticação e probabilidades dos jogos PGSoft.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Credenciais */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                ✅ Fonte Única de Credenciais
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Esta é a <strong>ÚNICA</strong> página onde você configura as credenciais de autenticação (tokens e secret keys). O backend usa essas credenciais para se comunicar com o motor.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Probabilidades */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Probabilidades
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Controle fino da taxa de ganho dos jogadores. Valores entre 30-50% são recomendados para equilíbrio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso sobre sincronização com Settings */}
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-400 dark:bg-yellow-600 rounded-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              ⚙️ Configuração em 2 Passos
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Configure o Agent aqui (esta página)</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">Defina agentToken, secretKey, callback URL e probabilidades</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Configure a URL da API em Settings</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                    Vá para <a href="/dashboard/settings" className="underline text-blue-600 dark:text-blue-400">Configurações → Chaves de Jogos</a> e defina onde está rodando o motor PGSoft
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fluxo de Comunicação */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          Como Funciona o Fluxo de Comunicação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">1</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Frontend</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Usuário clica em jogar</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-purple-400">→</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Backend</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Envia credenciais daqui</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-blue-400">⇄</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg font-bold text-green-600 dark:text-green-400">3</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Motor PGSoft</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Valida e executa</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Callbacks automáticos:</strong> O motor usa o <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">callbackurl</code> do agent para:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
            <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">POST callbackurl + "pgsoft/user_balance"</code> - Consultar saldo do usuário</li>
            <li><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">POST callbackurl + "pgsoft/game_callback"</code> - Notificar apostas e ganhos</li>
          </ul>
        </div>
      </div>

      {/* Toggle de dados sensíveis */}
      <div className="mb-6">
        <button
          onClick={() => setShowSensitiveData(!showSensitiveData)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {showSensitiveData ? (
            <>
              <EyeOff className="w-4 h-4" />
              Ocultar Dados Sensíveis
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Mostrar Dados Sensíveis
            </>
          )}
        </button>
      </div>

      {/* Lista de Agents */}
      <div className="grid grid-cols-1 gap-6">
        {agents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum agent cadastrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crie seu primeiro agent para começar a usar o motor de jogos
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Agent
            </button>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-500" />
                    {agent.agentcode}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ID: {agent.id} • Criado em:{' '}
                    {new Date(agent.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingAgent(agent)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id, agent.agentcode)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Deletar"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Credenciais */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    Credenciais de Autenticação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Key className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Agent Token
                        </span>
                      </div>
                      <code className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded block truncate">
                        {showSensitiveData
                          ? agent.agentToken
                          : '••••••••••••••••'}
                      </code>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Secret Key
                        </span>
                      </div>
                      <code className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded block truncate">
                        {showSensitiveData
                          ? agent.secretKey
                          : '••••••••••••••••'}
                      </code>
                    </div>
                    <div className="md:col-span-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Callback URL
                        </span>
                      </div>
                      <code className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded block truncate">
                        {agent.callbackurl}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Probabilidades com visual melhorado */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Probabilidades Configuradas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: 'Padrão', value: agent.probganho, color: 'purple' },
                      { label: 'Bônus', value: agent.probbonus, color: 'pink' },
                      { label: 'RTP', value: agent.probganhortp, color: 'blue' },
                      { label: 'Influencer', value: agent.probganhoinfluencer, color: 'green' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {item.label}
                        </div>
                        <div className={`text-lg font-bold text-${item.color}-600 dark:text-${item.color}-400 flex items-baseline gap-1`}>
                          {item.value}
                          <span className="text-xs">%</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-600`}
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Média geral */}
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Probabilidade Média de Ganho
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {Math.round((agent.probganho + agent.probbonus + agent.probganhortp) / 3)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {(isCreating || editingAgent) && (
        <AgentFormModal
          agent={editingAgent}
          onClose={() => {
            setIsCreating(false);
            setEditingAgent(null);
          }}
          onSubmit={(data) => {
            if (editingAgent) {
              updateMutation.mutate({ id: editingAgent.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Componente de Tooltip
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-50 w-64 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2 transform -translate-y-full">
        {content}
        <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
      </div>
    </div>
  );
}

// Componente de Modal para Criar/Editar Agent
function AgentFormModal({
  agent,
  onClose,
  onSubmit,
  isLoading,
}: {
  agent: Agent | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    agentcode: agent?.agentcode || '',
    agentToken: agent?.agentToken || '',
    secretKey: agent?.secretKey || '',
    callbackurl: agent?.callbackurl || '',
    probganho: agent?.probganho || 30,
    probbonus: agent?.probbonus || 30,
    probganhortp: agent?.probganhortp || 50,
    probganhoinfluencer: agent?.probganhoinfluencer || 70,
    probbonusinfluencer: agent?.probbonusinfluencer || 40,
    probganhoaposta: agent?.probganhoaposta || 30,
    probganhosaldo: agent?.probganhosaldo || 30,
    limitadorchicky: agent?.limitadorchicky || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {agent ? 'Editar Agent' : 'Criar Novo Agent'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                    O que é um Agent?
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                    Um agent é um operador cadastrado no motor de jogos PGSoft (banco SQLite). Ele contém:
                  </p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
                    <li><strong>Credenciais:</strong> agentToken e secretKey que o backend envia para iniciar jogos</li>
                    <li><strong>Callback URL:</strong> Para onde o motor envia notificações de apostas/ganhos</li>
                    <li><strong>Probabilidades:</strong> Controle fino do comportamento dos jogos</li>
                  </ul>
                  <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                      💡 Primeiro Passo: Configure o Agent aqui antes de usar os jogos!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-500" />
                Credenciais de Autenticação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Código do Agent <span className="text-red-500">*</span>
                    <Tooltip content="Identificador único do operador. Exemplo: 'admin', 'operator1'. Não pode ser alterado após criação.">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={formData.agentcode}
                    onChange={(e) =>
                      setFormData({ ...formData, agentcode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    disabled={!!agent}
                    placeholder="admin"
                  />
                  {!!agent && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      O código não pode ser alterado
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Agent Token <span className="text-red-500">*</span>
                    <Tooltip content="Token usado para autenticar requisições. Deve ser o mesmo configurado em 'Token de Autenticação' nas Configurações de Jogos.">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={formData.agentToken}
                    onChange={(e) =>
                      setFormData({ ...formData, agentToken: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="abc123token"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ⚠️ Deve corresponder ao token nas Configurações
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Secret Key <span className="text-red-500">*</span>
                    <Tooltip content="Chave secreta para validar callbacks. Deve ser a mesma configurada em 'Chave Secreta (Secret Key)' nas Configurações de Jogos.">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={formData.secretKey}
                    onChange={(e) =>
                      setFormData({ ...formData, secretKey: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="xyz789secret"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ⚠️ Deve corresponder à secret key nas Configurações
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Callback URL <span className="text-red-500">*</span>
                    <Tooltip content="URL do seu backend onde o motor de jogos enviará callbacks para consultar saldo e notificar apostas/ganhos. Deve terminar com /api/">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <input
                    type="url"
                    value={formData.callbackurl}
                    onChange={(e) =>
                      setFormData({ ...formData, callbackurl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://api.seusite.com/api/"
                    required
                  />
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs">
                    <p className="text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                      <Link2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Formato correto:</strong> https://seu-backend.com/api/ (com /api/ no final).<br />
                        O motor fará callbacks para: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">callbackurl + "pgsoft/user_balance"</code>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Probabilidades */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Probabilidades de Ganho (%)
              </h3>
              
              {/* Explicação das Probabilidades */}
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-800 dark:text-purple-200">
                    <p className="font-semibold mb-2">Como funcionam as probabilidades?</p>
                    <p>Estes valores controlam a chance de ganho nos jogos. Valores mais altos = maior chance de ganho para o jogador.</p>
                    <p className="mt-2"><strong>Valores padrão recomendados:</strong> 30-50% para jogos normais, 70% para influencers</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    key: 'probganho', 
                    label: 'Ganho Padrão',
                    icon: TrendingUp,
                    description: 'Probabilidade base de ganho para usuários normais',
                    recommended: '30%'
                  },
                  { 
                    key: 'probbonus', 
                    label: 'Bônus',
                    icon: Award,
                    description: 'Chance de ativar rodadas bônus/free spins',
                    recommended: '30%'
                  },
                  { 
                    key: 'probganhortp', 
                    label: 'RTP (Return to Player)',
                    icon: Zap,
                    description: 'Taxa de retorno ao jogador baseada no histórico de apostas',
                    recommended: '50%'
                  },
                  { 
                    key: 'probganhoinfluencer', 
                    label: 'Influencer - Ganho',
                    icon: TrendingUp,
                    description: 'Probabilidade de ganho para usuários marcados como influencers',
                    recommended: '70%'
                  },
                  { 
                    key: 'probbonusinfluencer', 
                    label: 'Influencer - Bônus',
                    icon: Award,
                    description: 'Chance de bônus para influencers (maior para aumentar engagement)',
                    recommended: '40%'
                  },
                  { 
                    key: 'probganhoaposta', 
                    label: 'Ganho por Aposta',
                    icon: Target,
                    description: 'Probabilidade baseada no valor apostado',
                    recommended: '30%'
                  },
                  { 
                    key: 'probganhosaldo', 
                    label: 'Ganho por Saldo',
                    icon: Activity,
                    description: 'Probabilidade baseada no saldo atual do usuário',
                    recommended: '30%'
                  },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {field.label}
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {field.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={(formData as any)[field.key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field.key]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">%</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Recomendado: {field.recommended}
                        </span>
                        <div className="flex gap-1">
                          {(formData as any)[field.key] <= 30 && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">Baixo</span>
                          )}
                          {(formData as any)[field.key] > 30 && (formData as any)[field.key] <= 60 && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">Médio</span>
                          )}
                          {(formData as any)[field.key] > 60 && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">Alto</span>
                          )}
                        </div>
                      </div>
                      {/* Barra visual */}
                      <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${(formData as any)[field.key]}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aviso importante */}
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-800 dark:text-orange-200">
                    <p className="font-semibold mb-1">⚠️ Atenção ao configurar probabilidades</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Valores muito altos ({'>'}70%) podem resultar em prejuízo financeiro</li>
                      <li>Valores muito baixos ({'<'}20%) podem afastar jogadores</li>
                      <li>Configure influencers com valores maiores para incentivar divulgação</li>
                      <li>Monitore o balanço financeiro após alterações</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Salvando...' : agent ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

