'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { LoaderLink } from './loader-link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Warehouse, 
  DollarSign, 
  Menu 
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Produção',
    href: '/dashboard/orders',
    icon: Layers,
    exact: false,
  },
  {
    name: 'Clientes',
    href: '/dashboard/customers',
    icon: Users,
    exact: false,
  },
  {
    name: 'Estoque',
    href: '/dashboard/inventory',
    icon: Warehouse,
    exact: false,
  },
  {
    name: 'Financeiro',
    href: '/dashboard/financial/cash-flow',
    icon: DollarSign,
    exact: false,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <LoaderLink
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-red-50 text-red-700 shadow-xs dark:bg-red-950/40 dark:text-red-300'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-red-600' : 'text-muted-foreground')} />
              <span>{item.name}</span>
            </LoaderLink>
          );
        })}
      </nav>

      {/* Mobile Hamburger Navigation */}
      <div className="flex md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-4">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>
                <Logo className="h-7" />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <LoaderLink
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', active ? 'text-red-600' : 'text-muted-foreground')} />
                    <span>{item.name}</span>
                  </LoaderLink>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
