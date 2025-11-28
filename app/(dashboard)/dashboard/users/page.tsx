'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, UserPlus, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User } from '@/types';
import Link from 'next/link';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const response = await adminApi.users.list(page, 20, search);
      return response.data.data;
    },
  });

  const columns = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'name',
      label: 'Nome',
      render: (user: User) => (
        <div>
          <p className="font-medium">{user.name} {user.lastName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'cpf',
      label: 'CPF',
    },
    {
      key: 'wallet',
      label: 'Saldo Normal',
      render: (user: User) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {user.wallet ? formatCurrency(user.wallet.balance) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'walletBonus',
      label: 'Saldo Bônus',
      render: (user: User) => (
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {user.wallet?.balanceBonus !== undefined 
              ? formatCurrency(user.wallet.balanceBonus) 
              : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <div className="space-y-1">
          {user.banned ? (
            <StatusBadge status={2} />
          ) : (
            <StatusBadge status={1} />
          )}
          {user.isAdmin && (
            <span className="block text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full inline-flex items-center">
              Admin
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      render: (user: User) => formatDate(user.createdAt),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (user: User) => (
        <Link
          href={`/dashboard/users/${user.id}`}
          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          Ver detalhes
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie todos os usuários do sistema
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.users || []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}

