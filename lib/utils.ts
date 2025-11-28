import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

export function formatDate(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string {
  return format(new Date(date), formatStr, { locale: ptBR });
}

export function getStatusBadgeColor(status: number): string {
  switch (status) {
    case 0:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 1:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 2:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export function getStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'Pendente';
    case 1:
      return 'Aprovado';
    case 2:
      return 'Rejeitado';
    default:
      return 'Desconhecido';
  }
}

export function truncateText(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

