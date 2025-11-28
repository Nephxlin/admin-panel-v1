'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Withdrawal } from '@/types';
import { toast } from 'react-hot-toast';

export default function WithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', page, statusFilter],
    queryFn: async () => {
      const response = await adminApi.withdrawals.list(page, 20, statusFilter);
      return response.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.withdrawals.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Saque aprovado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao aprovar saque');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.withdrawals.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Saque rejeitado!');
    },
    onError: () => {
      toast.error('Erro ao rejeitar saque');
    },
  });

  const columns = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'user',
      label: 'Usuário',
      render: (withdrawal: Withdrawal) => (
        <div>
          <p className="font-medium">
            {withdrawal.user?.name} {withdrawal.user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{withdrawal.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (withdrawal: Withdrawal) => (
        <span className="font-semibold">
          {formatCurrency(withdrawal.amount)}
        </span>
      ),
    },
    {
      key: 'pixKey',
      label: 'Chave PIX',
      render: (withdrawal: Withdrawal) => withdrawal.pixKey || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (withdrawal: Withdrawal) => (
        <StatusBadge status={withdrawal.status} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (withdrawal: Withdrawal) => formatDate(withdrawal.createdAt),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (withdrawal: Withdrawal) =>
        withdrawal.status === 0 ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => approveMutation.mutate(withdrawal.id)}
              disabled={approveMutation.isPending}
              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
              title="Aprovar"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => rejectMutation.mutate(withdrawal.id)}
              disabled={rejectMutation.isPending}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              title="Rejeitar"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Saques
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os saques dos usuários
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={statusFilter ?? ''}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === '' ? undefined : parseInt(e.target.value)
            )
          }
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
        >
          <option value="">Todos os status</option>
          <option value="0">Pendente</option>
          <option value="1">Aprovado</option>
          <option value="2">Rejeitado</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.withdrawals || []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}

