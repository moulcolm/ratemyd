'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image,
  CheckCircle,
  Flag,
  Users,
  DollarSign,
  History,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/moderation', label: 'Modération', icon: Image },
  { href: '/admin/verifications', label: 'Vérifications', icon: CheckCircle },
  { href: '/admin/reports', label: 'Signalements', icon: Flag },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/revenue', label: 'Revenus', icon: DollarSign },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au site
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-3">
          Administration
        </h2>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
        <p className="text-xs text-gray-500">
          Rappel: Toutes vos actions de modération sont enregistrées.
        </p>
      </div>
    </aside>
  );
}
