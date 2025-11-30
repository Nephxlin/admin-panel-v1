'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Gamepad2,
  Grid,
  Tag,
  Image,
  Trophy,
  Crown,
  Settings,
  Activity,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Depósitos',
    href: '/dashboard/deposits',
    icon: ArrowDownCircle,
  },
  {
    title: 'Saques',
    href: '/dashboard/withdrawals',
    icon: ArrowUpCircle,
  },
  {
    title: 'Carteiras',
    href: '/dashboard/wallets',
    icon: Wallet,
  },
  {
    title: 'Jogos',
    href: '/dashboard/games',
    icon: Gamepad2,
  },
  {
    title: 'Provedores',
    href: '/dashboard/providers',
    icon: Grid,
  },
  {
    title: 'Categorias',
    href: '/dashboard/categories',
    icon: Tag,
  },
  {
    title: 'Banners',
    href: '/dashboard/banners',
    icon: Image,
  },
  {
    title: 'Missões',
    href: '/dashboard/missions',
    icon: Trophy,
  },
  {
    title: 'VIP',
    href: '/dashboard/vips',
    icon: Crown,
  },
  {
    title: 'Kwai Pixels',
    href: '/dashboard/kwai-pixels',
    icon: Activity,
  },
  {
    title: 'Motor PGSoft',
    href: '/dashboard/pgsoft-agents',
    icon: Server,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Cassino Admin
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="h-16 flex items-center justify-center border-t border-gray-200 dark:border-gray-700 px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Cassino Admin
          </p>
        </div>
      </div>
    </aside>
  );
}

