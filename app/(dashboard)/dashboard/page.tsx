'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsLimit] = useState(10);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await adminApi.dashboard.getStats();
      return response.data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: transactionsData, error: transactionsError } = useQuery({
    queryKey: ['dashboard-transactions', transactionsPage, transactionsLimit],
    queryFn: async () => {
      const response = await adminApi.dashboard.getTransactions(transactionsPage, transactionsLimit);
      return response.data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!stats, // Só executar após carregar stats
  });

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination;

  const { data: revenueChart, error: chartError } = useQuery({
    queryKey: ['dashboard-revenue-chart'],
    queryFn: async () => {
      const response = await adminApi.dashboard.getRevenueChart(7);
      return response.data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!stats, // Só executar após carregar stats
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar dados do dashboard
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Verifique se o backend está rodando
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visão geral do sistema
        </p>
      </div>

      {/* Stats Grid - Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats?.users.total || 0}
          subtitle={`${stats?.users.activeToday || 0} ativos hoje`}
          icon={Users}
          colorClass="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Depósitos Pendentes"
          value={`${stats?.deposits.pending?.count || 0} depósitos`}
          subtitle={formatCurrency(stats?.deposits.pending?.value || 0)}
          icon={ArrowDownCircle}
          colorClass="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Saques Pendentes"
          value={`${stats?.withdrawals.pending?.count || 0} saques`}
          subtitle={formatCurrency(stats?.withdrawals.pending?.value || 0)}
          icon={ArrowUpCircle}
          colorClass="from-red-500 to-pink-500"
        />
        <StatCard
          title="Saldo do Sistema"
          value={formatCurrency(stats?.systemBalance || 0)}
          subtitle={`Receita: ${formatCurrency(stats?.revenue || 0)}`}
          icon={Wallet}
          colorClass="from-purple-500 to-pink-500"
        />
      </div>

      {/* Transações Não Finalizadas - Compacto */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-orange-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transações Não Finalizadas (Canceladas Automaticamente)
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Depósitos Hoje</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.deposits.canceled?.today?.count || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(stats?.deposits.canceled?.today?.value || 0)}
            </p>
          </div>

          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Depósitos (7d)</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.deposits.canceled?.week?.count || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(stats?.deposits.canceled?.week?.value || 0)}
            </p>
          </div>

          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Saques Hoje</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats?.withdrawals.canceled?.today?.count || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(stats?.withdrawals.canceled?.today?.value || 0)}
            </p>
          </div>

          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Saques (7d)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats?.withdrawals.canceled?.week?.count || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(stats?.withdrawals.canceled?.week?.value || 0)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          💡 Transações canceladas após 5min pendentes (clientes que não finalizaram o processo)
        </p>
      </div>

      {/* Revenue Chart */}
      {revenueChart && revenueChart.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receita - Últimos 7 Dias
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comparativo entre depósitos e saques
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="deposits"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Depósitos"
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Saques"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions && transactions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Últimas Transações
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Últimas 10 transações no sistema
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction: any) => (
              <div
                key={`${transaction.type}-${transaction.id}`}
                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit'
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}
                    >
                      {transaction.type === 'deposit' ? (
                        <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.type === 'deposit'
                          ? 'Depósito'
                          : 'Saque'}{' '}
                        #{transaction.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusBadge status={transaction.status} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {transactions.length} de {pagination.total} transações
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTransactionsPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setTransactionsPage(p => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

