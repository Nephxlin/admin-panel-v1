'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Deposit } from '@/types';
import { toast } from 'react-hot-toast';

export default function DepositsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['deposits', page, statusFilter],
    queryFn: async () => {
      const response = await adminApi.deposits.list(page, 20, statusFilter);
      return response.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.deposits.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast.success('Depósito aprovado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao aprovar depósito');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.deposits.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast.success('Depósito rejeitado!');
    },
    onError: () => {
      toast.error('Erro ao rejeitar depósito');
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
      render: (deposit: Deposit) => (
        <div>
          <p className="font-medium">
            {deposit.user?.name} {deposit.user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{deposit.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (deposit: Deposit) => (
        <span className="font-semibold">{formatCurrency(deposit.amount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (deposit: Deposit) => <StatusBadge status={deposit.status} />,
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (deposit: Deposit) => formatDate(deposit.createdAt),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (deposit: Deposit) =>
        deposit.status === 0 ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => approveMutation.mutate(deposit.id)}
              disabled={approveMutation.isPending}
              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
              title="Aprovar"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => rejectMutation.mutate(deposit.id)}
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
            Depósitos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os depósitos dos usuários
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
        data={data?.deposits || []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}

