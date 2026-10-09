
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Eye, Printer, Edit, MoreHorizontal, Trash2, XCircle, Clock, Star, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockOrders } from '@/lib/mock-data';
import { useOrders, dataStore } from '@/lib/data-store';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStage, ArtSeparationStatus, StageHistory } from '@/lib/types';
import { orderSituations, artSeparationStatus } from '@/components/orders/order-constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { StageHistoryDialog } from '@/components/orders/order-stage-history';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { useLoader } from '@/hooks/use-loader';

const allStages: readonly OrderStage[] = orderSituations;
const allArtSeparationStatus: readonly ArtSeparationStatus[] = artSeparationStatus;

const sublimationAbbreviations: { [key: string]: string } = {
  'Sublimação Total Costas': 'Subl T. Costas',
  'Sublimação Total Frente': 'Subl T. Frente',
  'Sublimação Parcial A3': 'Subl A3',
  'Sublimação Parcial A4': 'Subl A4',
  'Sublimação Camisa Total': 'Subl Total',
  'Sublimação Total Mangas': 'Subl Mangas',
};

interface OrderRowProps {
  order: Order;
  onArtSeparationChange: (orderId: string, status: ArtSeparationStatus) => void;
  onPriorityChange: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintOrder: (orderId: string) => void;
}

function OrderRow({
  order,
  onArtSeparationChange,
  onPriorityChange,
  onCancelOrder,
  onDeleteOrder,
  onPrintOrder,
}: OrderRowProps) {
  const router = useRouter();
  const { showLoader } = useLoader();

  const [formattedOrderDate, setFormattedOrderDate] = React.useState('');
  const [formattedDeliveryDate, setFormattedDeliveryDate] = React.useState('');
  const [daysInProduction, setDaysInProduction] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (order.orderDate) {
      setFormattedOrderDate(
        format(parseISO(order.orderDate), 'dd/MM/yyyy')
      );
      setDaysInProduction(differenceInDays(new Date(), parseISO(order.orderDate)));
    }
    if (order.deliveryDate) {
      setFormattedDeliveryDate(
        format(parseISO(order.deliveryDate), 'dd/MM/yyyy')
      );
    }
  }, [order.orderDate, order.deliveryDate]);

  const getRowColor = () => {
    if (order.isPriority) return 'bg-blue-800 text-white';
    if (daysInProduction === null) return '';
    if (daysInProduction > 45) return 'bg-red-600 text-white';
    if (daysInProduction >= 30) return 'bg-red-300 text-black';
    if (daysInProduction >= 15) return 'bg-yellow-300 text-black';
    return '';
  };

  const abbreviatedTypes = order.type.map(t => sublimationAbbreviations[t] || t);

  return (
    <TableRow key={order.id} className={cn(getRowColor(), 'hover:text-black hover:font-bold')}>
      <TableCell className="p-2 font-medium w-[80px]">
        {order.id.replace('ORD', '')}
      </TableCell>
      <TableCell className="p-2">{order.customerName}</TableCell>
      <TableCell className="p-2">{order.customerResponsible}</TableCell>
      <TableCell className="p-2">{order.model}</TableCell>
      <TableCell className="p-2">
        <Badge variant="secondary">{abbreviatedTypes.join(', ')}</Badge>
      </TableCell>
      <TableCell className="p-2">
        <Badge variant="outline" className="bg-card text-card-foreground">{order.stage}</Badge>
      </TableCell>
      <TableCell className="p-2">{formattedOrderDate}</TableCell>
      <TableCell className="p-2">{formattedDeliveryDate}</TableCell>
      <TableCell className="p-2 text-center">{daysInProduction}</TableCell>
      <TableCell className="p-2">
        <div className="flex flex-col">
          <span className="font-semibold text-xs whitespace-nowrap">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(order.value)}
          </span>
          {order.costDetails && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-0.5 border whitespace-nowrap",
              order.costDetails.profitMarginPercent >= 30 ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
              order.costDetails.profitMarginPercent >= 15 ? "bg-amber-50 text-amber-700 border-amber-300" :
              "bg-rose-50 text-rose-700 border-rose-300"
            )}>
              {order.costDetails.profitMarginPercent.toFixed(1)}% ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.costDetails.netProfit)})
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="p-2">
        <Dialog>
          <DialogTrigger asChild>
            <Image
              src={order.imageUrls?.[0] || `https://placehold.co/40x40.png`}
              alt={order.model}
              width={40}
              height={40}
              className="rounded-md cursor-pointer"
              data-ai-hint="clothing apparel"
            />
          </DialogTrigger>
          <DialogContent className="p-0 max-w-2xl bg-transparent border-0 shadow-none">
            <DialogTitle className="sr-only">Layout do Pedido {order.customerName} - {order.model}</DialogTitle>
            <Carousel>
              <CarouselContent>
                {(order.imageUrls || [`https://placehold.co/800x400.png`]).map((url, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={url}
                      alt={`${order.model} - Imagem ${index + 1}`}
                      width={800}
                      height={400}
                      className="rounded-md"
                      data-ai-hint="clothing apparel"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {order.imageUrls && order.imageUrls.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                </>
              )}
            </Carousel>
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell className="p-2">
        <Select
          onValueChange={(value) =>
            onArtSeparationChange(order.id, value as ArtSeparationStatus)
          }
          value={order.artSeparation}
        >
          <SelectTrigger className={cn("w-[120px]", getRowColor() && "text-black")}>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {allArtSeparationStatus.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="p-2">
        <div className="flex items-center gap-2">
          <OrderDetailsDialog
            orderId={order.id}
            showActions={true}
            trigger={
                <Button variant={getRowColor() ? 'inverted' : 'outline'} size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-haspopup="true"
                size="icon"
                variant={getRowColor() ? 'inverted' : 'ghost'}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
               <LoaderLink href={`/dashboard/orders/${order.id.replace('ORD','')}/edit`}>
                <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
              </LoaderLink>
               <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onPrintOrder(order.id); }}>
                  <Printer className="mr-2 h-4 w-4" /> Imprimir
               </DropdownMenuItem>
               <StageHistoryDialog 
                  history={order.stageHistory} 
                  trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Clock className="mr-2 h-4 w-4" /> Ver Histórico
                      </DropdownMenuItem>
                  }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Star className="mr-2 h-4 w-4" />
                        {order.isPriority ? 'Desmarcar Prioridade' : 'Marcar Prioridade'}
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                        <AlertDialogDescription>
                            {order.isPriority
                                ? `Tem certeza de que deseja desmarcar o pedido de ${order.customerName} como prioridade?`
                                : `Tem certeza de que deseja marcar o pedido de ${order.customerName} como prioridade?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onPriorityChange(order.id)}>
                            {order.isPriority ? 'Sim, desmarcar' : 'Sim, marcar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
               <DropdownMenuSeparator />
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-amber-600 focus:text-amber-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancelar Pedido
                    </DropdownMenuItem>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja cancelar o pedido de ${order.customerName} - ${order.customerResponsible}? Ele será movido para a lista de cancelados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Não</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onCancelOrder(order.id)}>Sim, cancelar</AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-600 focus:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir Pedido
                    </DropdownMenuItem>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                           Tem certeza que deseja excluir o pedido de ${order.customerName} - ${order.customerResponsible}? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Não</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteOrder(order.id)}>Sim, excluir</AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

function OrdersPageContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { orders, cancelOrder, deleteOrder, saveOrder } = useOrders();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('todos');
  const router = useRouter();
  const { showLoader } = useLoader();

  const baseOrders = React.useMemo(() => {
    let filtered = orders
      .filter(
        (order) =>
          !['Finalizado', 'Entregue', 'Cancelado', 'Deletado'].includes(order.stage)
      );

    if (activeTab === 'prioridades') {
      filtered = filtered.filter(order => order.isPriority);
    } else if (activeTab === 'atrasados') {
      filtered = filtered.filter(order => {
        const daysInProd = differenceInDays(new Date(), new Date(order.orderDate));
        return daysInProd >= 30;
      });
    }

    return filtered.sort(
        (a, b) =>
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
      );
  }, [orders, activeTab]);

  const [filteredOrders, setFilteredOrders] =
    React.useState<Order[]>(baseOrders);

  React.useEffect(() => {
    setFilteredOrders(baseOrders);
  }, [baseOrders]);

  React.useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) {
      setFilteredOrders(baseOrders);
      return;
    }

    const results = baseOrders.filter((order) => {
      const deliveryDate = order.deliveryDate ? format(parseISO(order.deliveryDate), 'dd/MM/yyyy') : '';
      const orderDate = order.orderDate ? format(parseISO(order.orderDate), 'dd/MM/yyyy') : '';
      return (
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.customerResponsible.toLowerCase().includes(lowercasedTerm) ||
        order.model.toLowerCase().includes(lowercasedTerm) ||
        (Array.isArray(order.type) && order.type.join(', ').toLowerCase().includes(lowercasedTerm)) ||
        order.stage.toLowerCase().includes(lowercasedTerm) ||
        deliveryDate.includes(lowercasedTerm) ||
        order.artSeparation.toLowerCase().includes(lowercasedTerm) ||
        orderDate.includes(lowercasedTerm)
      );
    });
    setFilteredOrders(results);
  }, [searchTerm, baseOrders]);

  const handleArtSeparationChange = (
    orderId: string,
    status: ArtSeparationStatus
  ) => {
    saveOrder({ id: orderId, artSeparation: status });
    const ord = orders.find(o => o.id === orderId);
    toast({
      title: 'Status da Arte Alterado!',
      description: `Pedido de ${ord?.customerName} - ${ord?.customerResponsible} atualizado para "${status}".`,
    });
  };
  
  const handlePrintOrder = (orderId: string) => {
    showLoader();
    router.push(`/dashboard/orders/${orderId.replace('ORD', '')}?print=true`);
  };

  const handlePriorityChange = (orderId: string) => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;
    const isPriority = !ord.isPriority;
    saveOrder({ id: orderId, isPriority });
    toast({
      title: 'Prioridade Alterada!',
      description: `Pedido de ${ord.customerName} - ${ord.customerResponsible} ${
        isPriority ? 'marcado como' : 'desmarcado de'
      } prioridade.`,
    });
  };
  
  const handleCancelOrder = (orderId: string) => {
    const ord = orders.find(o => o.id === orderId);
    cancelOrder(orderId);
    toast({
      title: 'Pedido Cancelado!',
      description: `O pedido de ${ord?.customerName || 'Cliente'} foi movido para a lista de cancelados.`,
      variant: "destructive"
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    toast({
      title: 'Pedido Excluído!',
      description: `O pedido foi movido para a lixeira.`,
      variant: "destructive"
    });
  };

  const getRowColorForPrint = (order: Order) => {
    const daysInProduction = order.orderDate ? differenceInDays(new Date(), parseISO(order.orderDate)) : null;
    if (order.isPriority) return 'bg-blue-800 text-white';
    if (daysInProduction === null) return '';
    if (daysInProduction > 45) return 'bg-red-600 text-white';
    if (daysInProduction >= 30) return 'bg-red-300 text-black';
    if (daysInProduction >= 15) return 'bg-yellow-300 text-black';
    return '';
  };

  const getSortPriority = (order: Order): number => {
    const daysInProduction = order.orderDate ? differenceInDays(new Date(), parseISO(order.orderDate)) : 0;
    if (order.isPriority) return 1; // Azul
    if (daysInProduction > 45) return 2; // Vermelho Forte
    if (daysInProduction >= 30) return 3; // Vermelho Claro
    if (daysInProduction >= 15) return 4; // Amarelo
    return 5; // Branco
  };

  const printedOrders = React.useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
        const priorityA = getSortPriority(a);
        const priorityB = getSortPriority(b);
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        // If priorities are the same, sort by delivery date
        return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
    });
  }, [filteredOrders]);


  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
    <div className='no-print'>
        <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                    <LoaderLink href="/dashboard">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Home className="h-4 w-4" />
                        </Button>
                    </LoaderLink>
                    <Button onClick={() => window.print()} variant="outline" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
                <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">
                    Produção Geral
                </h1>
                <p className="text-muted-foreground">
                    Acompanhe e gerencie todos os pedidos em produção.
                </p>
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Buscar pedidos..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <LoaderLink href="/dashboard/orders/new">
                <Button>
                Novo Pedido <PlusCircle className="ml-2 h-4 w-4" />
                </Button>
            </LoaderLink>
            </div>
        </div>

        {/* Resumo Financeiro da Produção Geral (Exclusivo para Gestão) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 shadow-xs border bg-white">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Pedidos em Produção
            </span>
            <span className="text-xl font-bold text-gray-900 block mt-1">
              {filteredOrders.length}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {filteredOrders.reduce((sum, o) => sum + (o.quantity || 1), 0)} peças no chão de fábrica
            </span>
          </Card>

          <Card className="p-3 shadow-xs border bg-white">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Faturamento Previsto
            </span>
            <span className="text-xl font-bold text-gray-900 block mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredOrders.reduce((sum, o) => sum + (o.value || 0), 0)
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Valor bruto total dos pedidos
            </span>
          </Card>

          <Card className="p-3 shadow-xs border bg-white">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Custo de Produção (CPV)
            </span>
            <span className="text-xl font-bold text-gray-700 block mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredOrders.reduce((sum, o) => sum + (o.costDetails?.totalCost || 0), 0)
              )}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Tecido, estampa e facção
            </span>
          </Card>

          <Card className="p-3 shadow-xs border bg-emerald-50/50 border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Lucro Líquido Previsto
            </span>
            <span className="text-xl font-bold text-emerald-700 block mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filteredOrders.reduce((sum, o) => sum + (o.costDetails?.netProfit || 0), 0)
              )}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Margem média: {(() => {
                const totalRev = filteredOrders.reduce((sum, o) => sum + (o.value || 0), 0);
                const totalProf = filteredOrders.reduce((sum, o) => sum + (o.costDetails?.netProfit || 0), 0);
                return totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : '0.0';
              })()}%
            </span>
          </Card>
        </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="prioridades">Prioridades</TabsTrigger>
                    <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
                </TabsList>
                <TabsContent value="todos">
                    <Card>
                        <CardContent className="p-0">
                        <TableComponent orders={filteredOrders} onArtSeparationChange={handleArtSeparationChange} onPriorityChange={handlePriorityChange} onCancelOrder={handleCancelOrder} onDeleteOrder={handleDeleteOrder} onPrintOrder={handlePrintOrder} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="prioridades">
                    <Card>
                        <CardContent className="p-0">
                        <TableComponent orders={filteredOrders} onArtSeparationChange={handleArtSeparationChange} onPriorityChange={handlePriorityChange} onCancelOrder={handleCancelOrder} onDeleteOrder={handleDeleteOrder} onPrintOrder={handlePrintOrder}/>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="atrasados">
                    <Card>
                        <CardContent className="p-0">
                        <TableComponent orders={filteredOrders} onArtSeparationChange={handleArtSeparationChange} onPriorityChange={handlePriorityChange} onCancelOrder={handleCancelOrder} onDeleteOrder={handleDeleteOrder} onPrintOrder={handlePrintOrder}/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
      <div className="print-summary">
        <h1 className="text-xl font-bold mb-4">Relatório de Produção Geral</h1>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Estampa</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Data Entrega</TableHead>
                    <TableHead>Dias Prod.</TableHead>
                    <TableHead>Valor</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {printedOrders.map((order) => {
                    const deliveryDate = order.deliveryDate ? format(parseISO(order.deliveryDate), 'dd/MM/yyyy') : '';
                    const daysInProduction = order.orderDate ? differenceInDays(new Date(), parseISO(order.orderDate)) : null;
                    const abbreviatedTypes = order.type.map(t => sublimationAbbreviations[t] || t);
                    return (
                        <TableRow key={order.id} className={getRowColorForPrint(order)}>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.customerResponsible}</TableCell>
                            <TableCell>{order.model}</TableCell>
                            <TableCell>{abbreviatedTypes.join(', ')}</TableCell>
                            <TableCell>{order.stage}</TableCell>
                            <TableCell>{deliveryDate}</TableCell>
                            <TableCell className="text-center">{daysInProduction}</TableCell>
                            <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
      </div>
    </>
  );
}

const TableComponent = ({
  orders,
  onArtSeparationChange,
  onPriorityChange,
  onCancelOrder,
  onDeleteOrder,
  onPrintOrder
}: {
  orders: Order[];
  onArtSeparationChange: (orderId: string, status: ArtSeparationStatus) => void;
  onPriorityChange: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintOrder: (orderId: string) => void;
}) => (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="h-10 px-2 w-[80px]">Pedido</TableHead>
        <TableHead className="h-10 px-2">Empresa</TableHead>
        <TableHead className="h-10 px-2">Cliente</TableHead>
        <TableHead className="h-10 px-2">Modelo</TableHead>
        <TableHead className="h-10 px-2">Estampa</TableHead>
        <TableHead className="h-10 px-2">Etapa</TableHead>
        <TableHead className="h-10 px-2">Data Encomenda</TableHead>
        <TableHead className="h-10 px-2">Data Entrega</TableHead>
        <TableHead className="h-10 px-2">Dias Prod.</TableHead>
        <TableHead className="h-10 px-2">Valor / Margem</TableHead>
        <TableHead className="h-10 px-2">Layout</TableHead>
        <TableHead className="h-10 px-2 w-[140px]">Arte</TableHead>
        <TableHead className="h-10 px-2">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.length > 0 ? (
        orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            onArtSeparationChange={onArtSeparationChange}
            onPriorityChange={onPriorityChange}
            onCancelOrder={onCancelOrder}
            onDeleteOrder={onDeleteOrder}
            onPrintOrder={onPrintOrder}
          />
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={13} className="p-2 text-center h-24">
            Nenhum pedido encontrado.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);


export default function OrdersPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <OrdersPageContent />
    </React.Suspense>
  );
}
