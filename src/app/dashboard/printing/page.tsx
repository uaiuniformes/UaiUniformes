
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, Check, ArrowLeft, Home, FileWarning, AlertTriangle, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StageHeader } from '@/components/dashboard/stage-header';
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
import { useOrders } from '@/lib/data-store';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { sendOrderStatusNotification } from '@/components/orders/order-actions';
import type { Order, OrderStage } from '@/lib/types';
import { orderSituations, stampTypes } from '@/components/orders/order-constants';
import { differenceInDays, format } from 'date-fns';
import { Input } from '@/components/ui/input';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';

const allStages: readonly OrderStage[] = orderSituations;

type FilterType =
  | 'Todos'
  | 'Eventos/Prioridade'
  | 'Bordados'
  | 'Sublimações'
  | 'Silk';

const STAGE_DEADLINES = {
    'Silk': 10,
    'Silk Digital (DTF)': 10,
    'Policromia': 10,
    'Bordado': 15,
    'Sublimação Parcial A4': 10,
    'Sublimação Parcial A3': 10,
    'Sublimação Total Frente': 10,
    'Sublimação Total Costas': 10,
    'Sublimação Total Mangas': 10,
    'Sublimação Camisa Total': 10,
};

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
  onStageChange: (orderId: string, newStage: OrderStage, reason?: string) => void;
  onRecordLoss: (orderId: string, description: string) => void;
}

function OrderRow({ order, onStageChange, onRecordLoss }: OrderRowProps) {
  const [daysInProduction, setDaysInProduction] = React.useState<number | null>(null);
  const [daysInStage, setDaysInStage] = React.useState<number | null>(null);
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [isStageOverdue, setIsStageOverdue] = React.useState(false);

  React.useEffect(() => {
    if (order.deliveryDate) {
        setDeliveryDate(new Date(order.deliveryDate).toLocaleDateString('pt-BR'));
    }
    if (order.orderDate) {
      const today = new Date();
      const orderDate = new Date(order.orderDate);
      setDaysInProduction(differenceInDays(today, orderDate));
    }
    if (order.stageHistory && order.stageHistory.length > 0) {
      const currentStageEntry = order.stageHistory[order.stageHistory.length - 1];
      if (currentStageEntry) {
        const days = differenceInDays(new Date(), new Date(currentStageEntry.startDate));
        setDaysInStage(days);

        const isEmbroidery = order.type.includes('Bordado');
        const deadline = isEmbroidery ? STAGE_DEADLINES['Bordado'] : 10;
        setIsStageOverdue(days > deadline);
      }
    }
  }, [order]);

  const getRowColor = () => {
    if (order.isPriority) return 'bg-blue-800 text-white';
    if (daysInProduction === null) return '';
    if (daysInProduction > 45) return 'bg-red-600 text-white';
    if (daysInProduction >= 30) return 'bg-red-300 text-black';
    if (daysInProduction >= 15) return 'bg-yellow-300 text-black';
    return '';
  };

  const nextStage: OrderStage = 'Separação';
  
  const abbreviatedTypes = order.type.map(t => sublimationAbbreviations[t] || t);

  return (
    <TableRow key={order.id} className={cn(getRowColor(), 'hover:text-black hover:font-bold')}>
      <TableCell className="p-2 font-medium w-[80px]">
        {order.id.replace('ORD', '')}
      </TableCell>
      <TableCell className="p-2">{order.customerName}</TableCell>
      <TableCell className="p-2">{order.customerResponsible}</TableCell>
      <TableCell className="p-2">
        <Badge variant="secondary">{abbreviatedTypes.join(', ')}</Badge>
      </TableCell>
      <TableCell className="p-2">{deliveryDate}</TableCell>
      <TableCell className="p-2 text-center">{daysInProduction}</TableCell>
      <TableCell className="p-2 text-center">{daysInStage}</TableCell>
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
            <DialogHeader>
              <DialogTitle className="sr-only">
                Layout do Pedido {order.customerName} - {order.model}
              </DialogTitle>
            </DialogHeader>
            <Carousel>
              <CarouselContent>
                {(order.imageUrls || [`https://placehold.co/800x400.png`]).map(
                  (url, index) => (
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
                  )
                )}
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
        <div className="flex items-center gap-2">
           {isStageOverdue && (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant='outline' size="icon" className="border-purple-500 text-purple-500 hover:bg-purple-50 animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-purple-500" /> Alerta de Prazo Excedido</DialogTitle>
                         <DialogDescription>Pedido: {order.id.replace('ORD', '')} - {order.customerName}</DialogDescription>
                    </DialogHeader>
                    <p className="py-4 text-sm">
                       Este material passou o prazo estabelecido para a etapa de <strong>Estampagem</strong>. Por favor, regularize-o para não ocorrer atraso na entrega final do pedido.
                    </p>
                </DialogContent>
            </Dialog>
          )}
          {nextStage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={getRowColor() ? 'inverted' : 'outline'}
                  size="icon"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deseja mover o pedido de {order.customerName} para a etapa "{nextStage}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onStageChange(order.id, nextStage!)}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <OrderDetailsDialog
            orderId={order.id}
            isProductionStage={true}
            trigger={
                <Button variant={getRowColor() ? 'inverted' : 'outline'} size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            }
          />
           <RecordLossDialog order={order} onConfirm={onRecordLoss} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function RecordLossDialog({ order, onConfirm }: { order: Order, onConfirm: (orderId: string, description: string) => void }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [description, setDescription] = React.useState('');

    const handleConfirm = () => {
        onConfirm(order.id, description);
        setIsOpen(false);
        setDescription('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline" size="icon" className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
                    <FileWarning className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Perda e Enviar para Reposição</DialogTitle>
                    <DialogDescription>
                       Pedido {order.id.replace('ORD','')} - {order.customerName}. Descreva a perda ocorrida para que a equipe de corte possa fazer a reposição.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="loss-description">Descrição da Perda (mín. 10 caracteres)</Label>
                        <Textarea 
                            id="loss-description"
                            placeholder="Ex: 1 camisa tamanho M manchou na estampa da frente."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={description.trim().length < 10}>
                        Enviar para Reposição
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function PrintingPageContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] =
    React.useState<FilterType>('Todos');
  const { orders, advanceOrderStage } = useOrders();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const handleBackClick = () => {
    showLoader();
    router.back();
  }

  const baseOrders = React.useMemo(() => {
    let printingOrders = orders.filter((order) => order.stage === 'Estampagem');
    
    const silkTypes: readonly string[] = ['Silk', 'Silk Digital (DTF)', 'Policromia'];
    const sublimationTypes: readonly string[] = ['Sublimação Parcial A4', 'Sublimação Parcial A3', 'Sublimação Total Frente', 'Sublimação Total Costas', 'Sublimação Total Mangas', 'Sublimação Camisa Total'];
    const embroideryTypes: readonly string[] = ['Bordado'];

    let eventOrders = printingOrders.filter(o => o.isPriority || o.productionType === 'Eventos/Prioridade');
    let nonEventOrders = printingOrders.filter(o => !eventOrders.some(eo => eo.id === o.id));

    let filtered: Order[];

    switch (activeFilter) {
        case 'Todos':
            filtered = printingOrders;
            break;
        case 'Eventos/Prioridade':
            filtered = eventOrders;
            break;
        case 'Bordados':
            filtered = nonEventOrders.filter(o => o.type.some(t => embroideryTypes.includes(t)));
            break;
        case 'Sublimações':
            filtered = nonEventOrders.filter(o => o.type.some(t => sublimationTypes.includes(t)));
            break;
        case 'Silk':
            filtered = nonEventOrders.filter(o => o.type.some(t => silkTypes.includes(t)));
            break;
        default:
            filtered = [];
            break;
    }

    return filtered.sort(
      (a, b) =>
        new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    );
  }, [activeFilter, orders]);

  const [filteredOrders, setFilteredOrders] =
    React.useState<Order[]>(baseOrders);

  const printingTotalPieces = React.useMemo(() => {
    return baseOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  }, [baseOrders]);

  const printingOverdueOrders = React.useMemo(() => {
    return baseOrders.filter((o) => {
      const days = o.stageHistory
        ? differenceInDays(new Date(), new Date(o.stageHistory[o.stageHistory.length - 1].startDate))
        : 0;
      const isEmbroidery = o.type.includes('Bordado');
      const deadline = isEmbroidery ? STAGE_DEADLINES['Bordado'] : 10;
      return days > deadline;
    }).length;
  }, [baseOrders]);

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
      const deliveryDate = format(new Date(order.deliveryDate), 'dd/MM/yyyy');
      return (
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.customerResponsible.toLowerCase().includes(lowercasedTerm) ||
        order.model.toLowerCase().includes(lowercasedTerm) ||
        order.type.join(', ').toLowerCase().includes(lowercasedTerm) ||
        deliveryDate.includes(lowercasedTerm)
      );
    });
    setFilteredOrders(results);
  }, [searchTerm, baseOrders]);

  const handleStageChange = async (orderId: string, newStage: OrderStage, reason?: string) => {
    showLoader();
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const order = orders.find((o) => o.id === orderId);
        advanceOrderStage(orderId, newStage, reason ? { reason } : undefined);

        if (order) {
            toast({
                title: 'Etapa do Pedido Atualizada!',
                description: `Pedido de ${order.customerName} movido para "${newStage}".`,
            });
            
            const daysInStage = order.stageHistory ? differenceInDays(new Date(), new Date(order.stageHistory[order.stageHistory.length-1].startDate)) : 0;
            const isEmbroidery = order.type.includes('Bordado');
            const deadline = isEmbroidery ? STAGE_DEADLINES['Bordado'] : 10;
            const isOverdue = daysInStage > deadline;
            
            const notificationResult = await sendOrderStatusNotification(order, isOverdue);
            if (notificationResult.customerMessage) {
              toast({
                title: 'Notificação para Cliente',
                description: notificationResult.customerMessage,
                variant: notificationResult.success ? 'default' : 'destructive',
              });
            }
            if (notificationResult.internalMessage) {
                toast({
                  title: 'Notificação Interna',
                  description: notificationResult.internalMessage,
                  variant: notificationResult.success ? 'default' : 'destructive',
                });
            }
        }
    } finally {
        hideLoader();
    }
  };
  
  const handleRecordLoss = (orderId: string, description: string) => {
    const newStage: OrderStage = 'Reposição de Corte';
    const order = orders.find(o => o.id === orderId);
    const newLossRecord = {
      date: new Date().toISOString(),
      description,
      stage: 'Estampagem' as OrderStage,
    };
    advanceOrderStage(orderId, newStage, {
      reason: description,
      lossRecords: [...(order?.lossRecords || []), newLossRecord],
    });
    toast({
      title: 'Perda Registrada!',
      description: `O pedido ${orderId.replace('ORD','')} foi enviado para reposição no corte.`,
      variant: 'destructive'
    });
  };

  const filters: FilterType[] = [
    'Todos',
    'Eventos/Prioridade',
    'Bordados',
    'Sublimações',
    'Silk',
  ];

  return (
    <div className="flex flex-col gap-4">
      <StageHeader
        title="Setor de Estampagem & Personalização"
        subtitle="Silk screen, DTF digital, sublimação total e bordados computadorizados"
        icon={Palette}
        badgeText={activeFilter}
        gradient="from-amber-600 via-orange-500 to-amber-400"
        stats={{
          totalOrders: baseOrders.length,
          totalPieces: printingTotalPieces,
          priorityOrders: baseOrders.filter((o) => o.isPriority || o.productionType === 'Eventos/Prioridade').length,
          overdueOrders: printingOverdueOrders,
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleBackClick} variant="outline" size="sm" className="gap-1.5 border-border hover:bg-muted/80">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <LoaderLink href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 border-border hover:bg-muted/80">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </LoaderLink>
        </div>
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
      </div>
      
       <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>


      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10 px-2 w-[80px]">Pedido</TableHead>
                <TableHead className="h-10 px-2">Empresa</TableHead>
                <TableHead className="h-10 px-2">Cliente</TableHead>
                <TableHead className="h-10 px-2">Estampa</TableHead>
                <TableHead className="h-10 px-2">Data Entrega</TableHead>
                <TableHead className="h-10 px-2">Dias Prod.</TableHead>
                 <TableHead className="h-10 px-2">Dias Etapa</TableHead>
                <TableHead className="h-10 px-2">Layout</TableHead>
                <TableHead className="h-10 px-2">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStageChange={handleStageChange}
                    onRecordLoss={handleRecordLoss}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="p-2 text-center h-24">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PrintingPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <PrintingPageContent />
    </React.Suspense>
  );
}
