'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Save, Settings as SettingsIcon, Settings, Key, CreditCard, Eye, EyeOff } from 'lucide-react';

type Tab = 'general' | 'games' | 'gateways';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const queryClient = useQueryClient();

  // Query para configurações gerais
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await adminApi.settings.get();
      return response.data.data;
    },
  });

  // Query para chaves de jogos
  const { data: gamesKeys, isLoading: loadingGamesKeys } = useQuery({
    queryKey: ['gamesKeys'],
    queryFn: async () => {
      const response = await adminApi.settings.getGamesKeys();
      return response.data.data;
    },
  });

  // Form para configurações gerais
  const { register: registerGeneral, handleSubmit: handleSubmitGeneral } = useForm({
    values: settings,
  });

  // Form para chaves de jogos
  const { register: registerGames, handleSubmit: handleSubmitGames } = useForm({
    values: gamesKeys,
  });

  // Mutation para atualizar configurações gerais
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => adminApi.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar configurações');
    },
  });

  // Mutation para atualizar chaves de jogos
  const updateGamesKeysMutation = useMutation({
    mutationFn: (data: any) => adminApi.settings.updateGamesKeys(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamesKeys'] });
      toast.success('Chaves de jogos atualizadas com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar chaves de jogos');
    },
  });

  const onSubmitGeneral = (data: any) => {
    // Remover campos somente leitura
    const { id, createdAt, updatedAt, ...editableData } = data;
    
    // Processar dados para garantir tipos corretos
    const processedData = Object.entries(editableData).reduce((acc: any, [key, value]) => {
      // Ignorar valores vazios/null/undefined, exceto para campos que podem ser null
      if (value === null || value === undefined || value === '') {
        // Campos que podem ser null
        if (key === 'softwareLogo' || key === 'softwareFavicon') {
          acc[key] = null;
        }
        // Outros campos vazios não são enviados
        return acc;
      }
      
      // Converter strings numéricas em números
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }
      
      return acc;
    }, {});
    
    updateSettingsMutation.mutate(processedData);
  };

  const onSubmitGames = (data: any) => {
    // Remover campos somente leitura e filtrar valores vazios
    const { id, createdAt, updatedAt, ...editableData } = data;
    
    // Filtrar campos vazios/null/undefined para enviar apenas valores válidos
    const filteredData = Object.entries(editableData).reduce((acc: any, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    updateGamesKeysMutation.mutate(filteredData);
  };

  const tabs = [
    { id: 'general' as Tab, label: 'Geral', icon: SettingsIcon },
    { id: 'games' as Tab, label: 'Chaves de Jogos', icon: Key },
    { id: 'gateways' as Tab, label: 'Gateways de Pagamento', icon: CreditCard },
  ];

  if (loadingSettings || loadingGamesKeys) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações do Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure os parâmetros e chaves da plataforma
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <form onSubmit={handleSubmitGeneral(onSubmitGeneral)} className="space-y-6">
          {/* Informações Gerais */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informações Gerais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código da Moeda
                </label>
                <input
                  {...registerGeneral('currencyCode')}
                  type="text"
                  placeholder="BRL"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prefixo (Símbolo)
                </label>
                <input
                  {...registerGeneral('prefix')}
                  type="text"
                  placeholder="R$"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Limites de Transação */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Limites de Transação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depósito Mínimo
                </label>
                <input
                  {...registerGeneral('minDeposit', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depósito Máximo
                </label>
                <input
                  {...registerGeneral('maxDeposit', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saque Mínimo
                </label>
                <input
                  {...registerGeneral('minWithdrawal', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saque Máximo
                </label>
                <input
                  {...registerGeneral('maxWithdrawal', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Bônus de Depósito */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bônus de Primeiro Depósito
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Percentual de Bônus (%)
                </label>
                <input
                  {...registerGeneral('depositBonus', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  max="500"
                  placeholder="Ex: 100 (dobra o depósito)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Percentual de bônus aplicado no primeiro depósito (0 = desabilitado)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rollover de Bônus (multiplicador)
                </label>
                <input
                  {...registerGeneral('depositBonusRollover', { valueAsNumber: true })}
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Ex: 30 (apostar 30x o valor do bônus)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quantas vezes o usuário precisa apostar o valor do bônus
                </p>
              </div>
            </div>
            
            {/* Checkbox para bônus apenas no primeiro depósito */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...registerGeneral('depositBonusFirstOnly')}
                  type="checkbox"
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Bônus apenas no primeiro depósito
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ✅ Marcado: O bônus será aplicado APENAS no primeiro depósito do usuário<br />
                    ❌ Desmarcado: O bônus será aplicado em TODOS os depósitos
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    ⚠️ Cuidado: Se desmarcar, todos os depósitos receberão bônus! Pode aumentar muito os custos.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Bônus de Cadastro */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bônus de Cadastro
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bônus por Cadastro (R$)
              </label>
              <input
                {...registerGeneral('signupBonus', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 10 (R$ 10 ao criar conta)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Valor em R$ creditado como bônus ao criar nova conta (0 = desabilitado)
              </p>
            </div>
          </div>

          {/* Bônus de Indicação */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bônus de Indicação
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor do Bônus por Indicação (R$)
              </label>
              <input
                {...registerGeneral('referralBonus', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 50"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Valor que tanto o indicador quanto o novo usuário recebem (0 = desabilitado)
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ Este bônus terá rollover configurado em "Rollover de Bônus"
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'games' && (
        <form onSubmit={handleSubmitGames(onSubmitGames)} className="space-y-6">
          {/* Botão para mostrar/ocultar dados sensíveis */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Dados Sensíveis
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {showSensitiveData 
                    ? 'Os valores sensíveis estão visíveis' 
                    : 'Os valores sensíveis estão ocultos por segurança'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {showSensitiveData ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar Valores
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Mostrar Valores
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Configurações do Backend - Callbacks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Callbacks do Backend
            </h2>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>📍 Para que serve:</strong> Esta URL será usada pelo motor de jogos para fazer callbacks (consultar saldo, processar apostas, etc.)
              </p>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL do Backend <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerGames('apiEndpoint')}
                  type="url"
                  placeholder="https://api.seudominio.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                URL base da sua API (onde o motor fará callbacks para: /api/pgsoft/user_balance e /api/pgsoft/game_callback)
              </p>
            </div>
          </div>

          {/* PGSoft - Motor de Jogos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  PGSoft - Motor de Jogos
            </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configuração de conexão com a API Node.js que processa os jogos PGSoft
                </p>
              </div>
              <a
                href="/dashboard/pgsoft-agents"
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Gerenciar Agents
              </a>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL da API PGSoft Node <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerGames('pgsoft')}
                  type="url"
                  placeholder="https://pgsoft.seudominio.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  URL onde está rodando o motor de jogos (api-pgsoft-node)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL Pública dos Jogos
                </label>
                <input
                  {...registerGames('pgsoftGameUrl')}
                  type="url"
                  placeholder="https://jogos.seudominio.com (opcional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  URL alternativa para servir os assets dos jogos. Deixe vazio para usar a mesma URL da API acima.
                </p>
              </div>
              </div>

            {/* Card informativo sobre Agents */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ✅ Credenciais e Probabilidades
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                    As <strong>credenciais de autenticação</strong> (agentToken, secretKey) e as <strong>probabilidades de ganho</strong> agora são configuradas exclusivamente na página de <strong>Agents PGSoft</strong>.
                  </p>
                  <a
                    href="/dashboard/pgsoft-agents"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Configurar Agents e Credenciais →
                  </a>
                </div>
              </div>
            </div>

            {/* Diagrama de comunicação simplificado */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
                💡 Fluxo de Comunicação:
              </p>
              <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li><strong>1.</strong> Seu Backend se conecta à API PGSoft usando a URL configurada acima</li>
                <li><strong>2.</strong> A API PGSoft valida credenciais através dos Agents cadastrados</li>
                <li><strong>3.</strong> Durante o jogo, a API faz callbacks para: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{apiEndpoint}'}/pgsoft/*</code></li>
              </ol>
            </div>
          </div>

          {/* Other Providers (placeholders) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Outros Provedores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salsa API
                </label>
                <input
                  {...registerGames('salsa')}
                  type="text"
                  placeholder="Chave da API Salsa"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vibra Gaming
                </label>
                <input
                  {...registerGames('vibra')}
                  type="text"
                  placeholder="Chave da API Vibra"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateGamesKeysMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {updateGamesKeysMutation.isPending ? 'Salvando...' : 'Salvar Chaves de Jogos'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'gateways' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gateways de Pagamento
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configuração de gateways de pagamento em desenvolvimento...
          </p>
        </div>
      )}
    </div>
  );
}
