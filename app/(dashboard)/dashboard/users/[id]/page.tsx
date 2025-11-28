'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Ban,
  CheckCircle,
  Edit,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldOff,
  X,
  Sparkles,
  Users,
  UserPlus,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  banned: boolean;
  isAdmin: boolean;
  inviterCode?: string;
  createdAt: string;
  wallet: {
    balance: number;
    balanceBonus: number;
    currency: string;
  };
  deposits: any[];
  withdrawals: any[];
  transactions: any[];
  invitedUsers?: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    wallet: {
      balance: number;
      balanceBonus: number;
    };
  }[];
}

interface EditUserFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  banned: boolean;
  isAdmin: boolean;
}

interface AdjustWalletFormData {
  amount: number;
  type: 'add' | 'subtract';
  targetField: 'balance' | 'bonus';
  description: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = parseInt(params.id as string);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    banned: false,
    isAdmin: false,
  });

  const [walletFormData, setWalletFormData] = useState<AdjustWalletFormData>({
    amount: 0,
    type: 'add',
    targetField: 'balance',
    description: '',
  });

  // Buscar dados do usuário
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await adminApi.users.get(userId);
      return response.data.data as User;
    },
    enabled: !!userId,
  });

  // Mutation para atualizar usuário
  const updateMutation = useMutation({
    mutationFn: (data: EditUserFormData) => adminApi.users.update(userId, data),
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar usuário');
    },
  });

  // Mutation para ajustar saldo
  const adjustWalletMutation = useMutation({
    mutationFn: (data: AdjustWalletFormData) =>
      adminApi.users.adjustWallet(userId, data),
    onSuccess: () => {
      toast.success('Saldo ajustado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsWalletModalOpen(false);
      setWalletFormData({ amount: 0, type: 'add', targetField: 'balance', description: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao ajustar saldo');
    },
  });

  // Mutation para banir/desbanir
  const toggleBanMutation = useMutation({
    mutationFn: () => adminApi.users.toggleBan(userId),
    onSuccess: () => {
      toast.success('Status de banimento alterado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao alterar status');
    },
  });

  // Abrir modal de edição
  const openEditModal = () => {
    if (user) {
      setEditFormData({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        banned: user.banned,
        isAdmin: user.isAdmin,
      });
      setIsEditModalOpen(true);
    }
  };

  // Submeter edição
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    updateMutation.mutate(editFormData);
  };

  // Submeter ajuste de saldo
  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (walletFormData.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    adjustWalletMutation.mutate(walletFormData);
  };

  // Formatar data
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-500">Usuário não encontrado</p>
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

  const depositColumns = [
    { key: 'id', label: 'ID', render: (row: any) => `#${row.id}` },
    {
      key: 'amount',
      label: 'Valor',
      render: (row: any) => formatCurrency(row.amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (row: any) => formatDate(row.createdAt),
    },
  ];

  const withdrawalColumns = [
    { key: 'id', label: 'ID', render: (row: any) => `#${row.id}` },
    {
      key: 'amount',
      label: 'Valor',
      render: (row: any) => formatCurrency(row.amount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (row: any) => formatDate(row.createdAt),
    },
  ];

  const transactionColumns = [
    { key: 'id', label: 'ID', render: (row: any) => `#${row.id}` },
    { key: 'type', label: 'Tipo' },
    {
      key: 'amount',
      label: 'Valor',
      render: (row: any) => formatCurrency(row.amount),
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (row: any) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.name} {user.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">ID: #{user.id}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => toggleBanMutation.mutate()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              user.banned
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {user.banned ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Desbanir
              </>
            ) : (
              <>
                <Ban className="w-5 h-5" />
                Banir
              </>
            )}
          </button>

          <button
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Edit className="w-5 h-5" />
            Editar
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Saldo Normal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Saldo Normal</span>
            <WalletIcon className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(user.wallet?.balance || 0)}
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Ajustar saldo
          </button>
        </div>

        {/* Saldo Bonus */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Saldo Bônus</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            {formatCurrency(user.wallet?.balanceBonus || 0)}
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Ajustar bônus
          </button>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Status</span>
            {user.banned ? (
              <Ban className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.banned ? 'Banido' : 'Ativo'}
          </div>
        </div>

        {/* Tipo de Conta */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Tipo</span>
            {user.isAdmin ? (
              <Shield className="w-5 h-5 text-purple-500" />
            ) : (
              <ShieldOff className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.isAdmin ? 'Admin' : 'Usuário'}
          </div>
        </div>

        {/* Data de Cadastro */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Membro desde
            </span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Informações Pessoais */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Informações Pessoais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Telefone</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.phone || 'Não informado'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CPF</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.cpf || 'Não informado'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de Indicações */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-500" />
            Sistema de Indicações
          </h2>
          {user.inviterCode && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Código: <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{user.inviterCode}</span>
            </div>
          )}
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Total de Indicados
                </div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {user.invitedUsers?.length || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Bônus por Indicação
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency((user.invitedUsers?.length || 0) * 50)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Link de Indicação
                </div>
                <div className="text-xs font-mono text-blue-700 dark:text-blue-300 mt-1">
                  /register?ref={user.inviterCode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Indicados */}
        {user.invitedUsers && user.invitedUsers.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Usuários Indicados ({user.invitedUsers.length})
            </h3>
            <div className="space-y-3">
              {user.invitedUsers.map((invited) => (
                <div
                  key={invited.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {invited.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {invited.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {invited.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Saldo
                      </div>
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(invited.wallet?.balance || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Bônus
                      </div>
                      <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {formatCurrency(invited.wallet?.balanceBonus || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Cadastro
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(invited.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/users/${invited.id}`)}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Este usuário ainda não indicou ninguém
            </p>
          </div>
        )}
      </div>

      {/* Depósitos Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Depósitos Recentes
        </h2>
        {user.deposits && user.deposits.length > 0 ? (
          <DataTable columns={depositColumns} data={user.deposits} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Nenhum depósito registrado</p>
        )}
      </div>

      {/* Saques Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Saques Recentes
        </h2>
        {user.withdrawals && user.withdrawals.length > 0 ? (
          <DataTable columns={withdrawalColumns} data={user.withdrawals} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Nenhum saque registrado</p>
        )}
      </div>

      {/* Transações Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Transações Recentes
        </h2>
        {user.transactions && user.transactions.length > 0 ? (
          <DataTable columns={transactionColumns} data={user.transactions} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Nenhuma transação registrada
          </p>
        )}
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Usuário
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={editFormData.isAdmin}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, isAdmin: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="isAdmin"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Administrador
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="banned"
                    checked={editFormData.banned}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, banned: e.target.checked })
                    }
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="banned"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Banido
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ajuste de Saldo */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Ajustar Saldo
              </h2>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWalletSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saldo Atual
                </label>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(user.wallet?.balance || 0)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Ajuste <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setWalletFormData({ ...walletFormData, type: 'add' })
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      walletFormData.type === 'add'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWalletFormData({ ...walletFormData, type: 'subtract' })
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      walletFormData.type === 'subtract'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5" />
                    Subtrair
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adicionar em <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setWalletFormData({ ...walletFormData, targetField: 'balance' })
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      walletFormData.targetField === 'balance'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <WalletIcon className="w-5 h-5" />
                    Saldo Normal
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWalletFormData({ ...walletFormData, targetField: 'bonus' })
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                      walletFormData.targetField === 'bonus'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    Saldo Bônus
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={walletFormData.amount}
                  onChange={(e) =>
                    setWalletFormData({
                      ...walletFormData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={walletFormData.description}
                  onChange={(e) =>
                    setWalletFormData({
                      ...walletFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Motivo do ajuste..."
                />
              </div>

              {/* Novo Saldo */}
              {walletFormData.amount > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Novo {walletFormData.targetField === 'bonus' ? 'Saldo Bônus' : 'Saldo Normal'}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(
                      (walletFormData.targetField === 'bonus' 
                        ? (user.wallet?.balanceBonus || 0) 
                        : (user.wallet?.balance || 0)) +
                        (walletFormData.type === 'add' ? 1 : -1) *
                          walletFormData.amount
                    )}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjustWalletMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adjustWalletMutation.isPending ? 'Ajustando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

