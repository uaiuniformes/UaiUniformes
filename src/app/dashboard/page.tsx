
'use client';

import {
  Package,
  Scissors,
  Palette,
  CheckCircle,
  Archive,
  Wrench,
  UserPlus,
  PlusCircle,
  Sheet,
  ListTodo,
  ThumbsUp,
  PackageCheck,
  Search,
  Hammer,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ProductionChart } from '@/components/dashboard/production-chart';
import {
  productionStats,
  monthlyProductionData,
  productionTypeData,
  recentOrdersData,
  cuttingChartData,
} from '@/lib/mock-data';
import { useOrders } from '@/lib/data-store';
import { ProductionTypeChart } from '@/components/dashboard/production-type-chart';
import { RecentOrdersTable } from '@/components/dashboard/recent-orders-table';
import { Button } from '@/components/ui/button';
import { CuttingChart } from '@/components/dashboard/cutting-chart';
import { Input } from '@/components/ui/input';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { PaymentType } from '@/lib/types';


export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { orders } = useOrders();

  const inProduction = orders.filter(o => !['Finalizado', 'Entregue', 'Cancelado', 'Deletado'].includes(o.stage)).length;
  const cuttingCount = orders.filter(o => o.stage === 'Corte').length;
  const printingCount = orders.filter(o => o.stage === 'Estampagem').length;
  const separationCount = orders.filter(o => o.stage === 'Separação' || o.artSeparation === 'À Separar').length;
  const sewingCount = orders.filter(o => o.stage === 'Costura').length;
  const finishingCount = orders.filter(o => o.stage === 'Arremate').length;
  const correctionCount = orders.filter(o => o.stage === 'Reposição de Corte' || o.stage === 'Correção').length;
  const finishedCount = orders.filter(o => o.stage === 'Finalizado').length;
  const deliveredCount = orders.filter(o => o.stage === 'Entregue').length;

  const [filteredRecentOrders, setFilteredRecentOrders] = React.useState(recentOrdersData);

  React.useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) {
      setFilteredRecentOrders(recentOrdersData);
      return;
    }
    
    const results = recentOrdersData.filter(order => 
      order.customerName?.toLowerCase().includes(lowercasedTerm) ||
      order.customerResponsible?.toLowerCase().includes(lowercasedTerm) ||
      order.model?.toLowerCase().includes(lowercasedTerm) ||
      order.type?.some(t => t.toLowerCase().includes(lowercasedTerm)) ||
      order.stage?.toLowerCase().includes(lowercasedTerm) ||
      order.status?.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredRecentOrders(results);
  }, [searchTerm]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Painel de Produção
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitoramento em tempo real do fluxo fabril da Uai Uniformes
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LoaderLink href="/dashboard/customers/new">
            <Button variant="outline" className="border-border hover:bg-muted/80">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </LoaderLink>
          <LoaderLink href="/dashboard/orders/new">
            <Button className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-800 hover:to-red-600 text-white shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </LoaderLink>
          <LoaderLink href="/dashboard/financial/cash-flow">
            <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" title="Fluxo de Caixa">
              <DollarSign className="h-4 w-4" />
            </Button>
          </LoaderLink>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4 py-2">
        <StatsCard
          title="Produção Geral"
          value={inProduction}
          icon={ListTodo}
          gradient="from-red-700 via-red-600 to-rose-500"
          href="/dashboard/orders"
        />
        <StatsCard
          title="Corte"
          value={cuttingCount}
          icon={Scissors}
          gradient="from-slate-700 via-zinc-600 to-slate-500"
          href="/dashboard/cutting"
        />
        <StatsCard
          title="Estampa"
          value={printingCount}
          icon={Palette}
          gradient="from-amber-600 via-orange-500 to-amber-400"
          href="/dashboard/printing"
        />
        <StatsCard
          title="Separação"
          value={separationCount}
          icon={Package}
          gradient="from-blue-600 via-sky-500 to-cyan-400"
          href="/dashboard/separation"
        />
        <StatsCard
          title="Costura"
          value={sewingCount}
          icon={Wrench}
          gradient="from-indigo-600 via-purple-500 to-violet-400"
          href="/dashboard/sewing"
        />
        <StatsCard
          title="Arremate"
          value={finishingCount}
          icon={Archive}
          gradient="from-teal-600 via-emerald-500 to-teal-400"
          href="/dashboard/finishing"
        />
        <StatsCard
          title="Correção"
          value={correctionCount}
          icon={Sheet}
          gradient="from-rose-600 via-red-500 to-orange-500"
          href="/dashboard/correction"
        />
        <StatsCard
          title="Finalizados"
          value={finishedCount}
          icon={ThumbsUp}
          gradient="from-emerald-600 via-green-500 to-emerald-400"
          href="/dashboard/finished"
        />
        <StatsCard
          title="Entregues"
          value={deliveredCount}
          icon={PackageCheck}
          gradient="from-blue-700 via-indigo-600 to-sky-500"
          href="/dashboard/delivered"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <ProductionChart data={monthlyProductionData} />
        <CuttingChart data={cuttingChartData} />
        <ProductionTypeChart data={productionTypeData} />
      </div>
      
       <div className="grid grid-cols-1 gap-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight">Pedidos Recentes</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar pedidos recentes..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>
          <RecentOrdersTable data={filteredRecentOrders} />
      </div>
    </>
  );
}
