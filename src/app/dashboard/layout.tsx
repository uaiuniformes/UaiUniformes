import Link from 'next/link';
import { Logo } from '@/components/logo';
import type { Metadata } from 'next';
import { UserNav } from '@/components/dashboard/user-nav';
import { MainNav } from '@/components/dashboard/main-nav';
import { HelpWidget } from '@/components/dashboard/help-widget';

export const metadata: Metadata = {
  title: 'Uai Uniformes - Produção',
  description: 'Sistema Integrado de Gestão e Controle Fabril Uai Uniformes',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/60 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/80 bg-white/95 px-4 md:px-6 shadow-xs backdrop-blur-sm dark:bg-zinc-900/90">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <Logo className="h-8" />
          </Link>
          <MainNav />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Status badge: Sistema Operacional */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Produção Online
          </div>

          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:p-8">
        {children}
      </main>
      <HelpWidget />
    </div>
  );
}

