
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, Check, ArrowLeft, Home, Scissors, Info, PackagePlus, AlertTriangle } from 'lucide-react';
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
import { mockOrders, mockProductionLots } from '@/lib/mock-data';
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
import type { Order, OrderStage, Cutter, ProductionLot } from '@/lib/types';
import { orderSituations, cutters } from '@/components/orders/order-constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
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
import { Label } from '@/components/ui/label';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { CuttingLotFormDialog } from '@/components/cutting/cutting-lot-form';
import { CuttingLotDetailsDialog } from '@/components/cutting/cutting-lot-details-dialog';
import { StageHeader } from '@/components/dashboard/stage-header';


const allCutters: Cutter[] = cutters;

type FilterType =
  | 'Todos'
  | 'Eventos/Prioridade'
  | 'Lisa'
  | 'Bordados'
  | 'Sublimações'
  | 'Silk';
  
type PageMode = 'cutting' | 'reposition' | 'faction';

const STAGE_DEADLINE = 10; // 10 dias para Corte

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
  onStageChange: (orderId: string, newStage: OrderStage) => void;
  mode: PageMode;
}

function OrderRow({
  order,
  onStageChange,
  mode,
}: OrderRowProps) {
  const [daysInProduction, setDaysInProduction] = React.useState<number | null>(null);
  const [daysInStage, setDaysInStage] = React.useState<number | null>(null);
  const [repositionReason, setRepositionReason] = React.useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = React.useState<string>('');
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
        setIsStageOverdue(days > STAGE_DEADLINE);
      }
    }
    if (mode === 'reposition' && order.lossRecords && order.lossRecords.length > 0) {
      const lastLossRecord = order.lossRecords[order.lossRecords.length - 1];
      setRepositionReason(lastLossRecord.description);
    }
  }, [order, mode]);

  const getRowColor = () => {
    if (order.isPriority) return 'bg-blue-800 text-white';
    if (daysInProduction === null) return '';
    if (daysInProduction > 45) return 'bg-red-600 text-white';
    if (daysInProduction >= 30) return 'bg-red-300 text-black';
    if (daysInProduction >= 15) return 'bg-yellow-300 text-black';
    return '';
  };
  
  const nextStage = 'Estampagem';
  const actionText = mode === 'cutting' ? `Mover para ${nextStage}?` : 'Reposição Concluída?';
  const actionDescription = mode === 'cutting' ? `Deseja mover o pedido de ${order.customerName} para a etapa "${nextStage}"?` : `Deseja enviar o pedido de ${order.customerName} de volta para a Estampagem?`;

  const abbreviatedTypes = order.type.map(t => sublimationAbbreviations[t] || t);

  return (
    <TableRow className={cn(getRowColor(), 'hover:text-black hover:font-bold')}>
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
            <DialogTitle className="sr-only">Layout do Pedido {order.customerName} - {order.model}</DialogTitle>
             <Carousel>
              <CarouselContent>
                {(order.imageUrls || [`https://placehold.co/800x400.png`]).map((url, index) => (
                  <CarouselItem key={index}>
                     <Dialog>
                        <DialogTrigger asChild>
                            <div className="p-1">
                                <Image
                                    src={url}
                                    alt={`Referência ${index + 1}`}
                                    width={800}
                                    height={400}
                                    className="rounded-md object-cover cursor-pointer aspect-[2/1] w-full"
                                    data-ai-hint="clothing apparel"
                                />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-4xl bg-transparent border-0 shadow-none">
                            <DialogTitle className="sr-only">Layout do Pedido {order.model} - Imagem {index + 1}</DialogTitle>
                            <Image
                                src={url}
                                alt={`Referência ${index + 1}`}
                                width={1200}
                                height={600}
                                className="rounded-md"
                                data-ai-hint="clothing apparel"
                            />
                        </DialogContent>
                    </Dialog>
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
                       Este material passou o prazo de <strong>{STAGE_DEADLINE} dias</strong> estabelecido para a etapa de <strong>Corte</strong>. Por favor, regularize-o para não ocorrer atraso na entrega final do pedido.
                    </p>
                </DialogContent>
            </Dialog>
          )}
          {nextStage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={getRowColor() ? 'inverted' : 'outline'} size="icon">
                  <Check className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{actionText}</AlertDialogTitle>
                  <AlertDialogDescription>{actionDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onStageChange(order.id, nextStage)}>
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
           {mode === 'reposition' && repositionReason && (
              <Dialog>
                  <DialogTrigger asChild>
                      <Button variant='outline' size="icon" className="border-amber-500 text-amber-500 hover:bg-amber-50">
                          <Info className="h-4 w-4" />
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Motivo da Reposição</DialogTitle>
                          <DialogDescription>Pedido: {order.id.replace('ORD', '')} - {order.customerName}</DialogDescription>
                      </DialogHeader>
                      <p className="py-4">{repositionReason}</p>
                  </DialogContent>
              </Dialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function CuttingTable({orders, onStageChange, mode}: {orders: Order[], onStageChange: (id: string, stage: OrderStage) => void, mode: PageMode}) {
   return (
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
                <TableHead className="h-10 px-2 text-center">Dias Prod.</TableHead>
                <TableHead className="h-10 px-2 text-center">Dias Etapa</TableHead>
                <TableHead className="h-10 px-2">Layout</TableHead>
                <TableHead className="h-10 px-2">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStageChange={onStageChange}
                    mode={mode}
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
   )
}


function FactionLotsTable({ lots, cutter, onSaveLot }: { lots: ProductionLot[], cutter: Cutter, onSaveLot: (lot: ProductionLot) => void }) {
  const [productionLots, setProductionLots] = React.useState(lots);

  React.useEffect(() => {
    setProductionLots(lots);
  }, [lots]);

  const handleSave = (lot: ProductionLot) => {
    onSaveLot(lot);
  };

  const filteredLots = lots.filter(lot => lot.cutter === cutter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lotes de Facção</CardTitle>
          <CuttingLotFormDialog onSave={handleSave} cutter={cutter}>
            <Button>
              <PackagePlus className="mr-2 h-4 w-4" />
              Criar Lote de Facção
            </Button>
          </CuttingLotFormDialog>
        </div>
        <CardDescription>
          Gerencie os lotes de pedidos enviados para as facções de corte.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Facção</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nº Pedidos</TableHead>
              <TableHead>Total Peças</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.length > 0 ? (
              filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.name}</TableCell>
                  <TableCell><Badge variant="outline">{lot.cutter}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{lot.status}</Badge></TableCell>
                  <TableCell>{lot.orderIds.length}</TableCell>
                  <TableCell>{lot.totalPieces}</TableCell>
                  <TableCell>{format(new Date(lot.creationDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <CuttingLotDetailsDialog lot={lot} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum lote de facção encontrado para esta cortadeira.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


function CuttingPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoader();

  const [activeTab, setActiveTab] = React.useState('cutting');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] =
    React.useState<FilterType>('Todos');
  const { orders, advanceOrderStage } = useOrders();
  const [productionLots, setProductionLots] = React.useState<ProductionLot[]>(mockProductionLots);
  const [showCutterModal, setShowCutterModal] = React.useState(false);

  const selectedCutter = searchParams.get('cutter') as Cutter | null;
  const [tempSelectedCutter, setTempSelectedCutter] = React.useState<Cutter | ''>(selectedCutter || '');
  
  React.useEffect(() => {
    if (!selectedCutter) {
      setShowCutterModal(true);
    } else {
      setShowCutterModal(false);
      hideLoader(); // Make sure loader is hidden when content is ready
    }
  }, [selectedCutter, hideLoader]);


  const cuttingQueueOrders = React.useMemo(() => {
    if (!selectedCutter) return [];

    let cuttingOrders = orders.filter((order) => order.stage === 'Corte' && order.cutter === selectedCutter);
    
    const silkTypes: readonly string[] = ['Silk', 'Silk Digital (DTF)', 'Policromia'];
    const sublimationTypes: readonly string[] = ['Sublimação Parcial A4', 'Sublimação Parcial A3', 'Sublimação Total Frente', 'Sublimação Total Costas', 'Sublimação Total Mangas', 'Sublimação Camisa Total'];
    const embroideryTypes: readonly string[] = ['Bordado'];
    const lisaTypes: readonly string[] = ['Lisa'];

    let eventOrders = cuttingOrders.filter(o => o.isPriority || o.productionType === 'Eventos/Prioridade');
    let nonEventOrders = cuttingOrders.filter(o => !eventOrders.some(eo => eo.id === o.id));

    let filtered: Order[];

    switch (activeFilter) {
        case 'Todos':
            filtered = cuttingOrders;
            break;
        case 'Eventos/Prioridade':
            filtered = eventOrders;
            break;
        case 'Lisa':
            filtered = nonEventOrders.filter(o => o.type.some(t => lisaTypes.includes(t)));
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

    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) return filtered;

    return filtered.filter((order) => {
      const deliveryDate = new Date(order.deliveryDate).toLocaleDateString('pt-BR');
      return (
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.customerResponsible.toLowerCase().includes(lowercasedTerm) ||
        order.model.toLowerCase().includes(lowercasedTerm) ||
        order.type.join(', ').toLowerCase().includes(lowercasedTerm) ||
        deliveryDate.includes(lowercasedTerm)
      );
    });
  }, [activeFilter, orders, selectedCutter, searchTerm]);
  
  const repositionOrders = React.useMemo(() => {
    if (!selectedCutter) return [];
    
    let filtered = orders.filter((order) => order.stage === 'Reposição de Corte' && order.cutter === selectedCutter);

    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) return filtered;

     return filtered.filter((order) => {
      return (
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.model.toLowerCase().includes(lowercasedTerm)
      );
    });

  }, [orders, selectedCutter, searchTerm]);

  const cutterAllOrders = React.useMemo(() => {
    if (!selectedCutter) return [];
    return orders.filter(
      (o) => o.cutter === selectedCutter && (o.stage === 'Corte' || o.stage === 'Reposição de Corte')
    );
  }, [orders, selectedCutter]);

  const cutterTotalPieces = React.useMemo(() => {
    return cutterAllOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  }, [cutterAllOrders]);

  const cutterOverdueOrders = React.useMemo(() => {
    return cutterAllOrders.filter((o) => {
      const days = o.stageHistory
        ? differenceInDays(new Date(), new Date(o.stageHistory[o.stageHistory.length - 1].startDate))
        : 0;
      return days > STAGE_DEADLINE;
    }).length;
  }, [cutterAllOrders]);

  const handleSaveLot = (lot: ProductionLot) => {
     setProductionLots(prev => {
      const existing = prev.find(l => l.id === lot.id);
      if (existing) {
        return prev.map(l => l.id === lot.id ? lot : l);
      }
      return [...prev, lot];
    });
  };

  const handleStageChange = async (orderId: string, newStage: OrderStage) => {
    showLoader();
    try {
        await new Promise(resolve => setTimeout(resolve, 300)); 
        const order = orders.find((o) => o.id === orderId);
        advanceOrderStage(orderId, newStage);
    
        if (order) {
            toast({
            title: 'Etapa do Pedido Atualizada!',
            description: `Pedido de ${order.customerName} movido para "${newStage}".`,
            });
            
            const daysInStage = order.stageHistory ? differenceInDays(new Date(), new Date(order.stageHistory[order.stageHistory.length-1].startDate)) : 0;
            const isOverdue = daysInStage > STAGE_DEADLINE;

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

  const handleSelectCutter = () => {
      if(tempSelectedCutter) {
        showLoader();
        router.push(`/dashboard/cutting?cutter=${encodeURIComponent(tempSelectedCutter)}`);
        setShowCutterModal(false);
      } else {
        toast({
            title: "Seleção Obrigatória",
            description: "Por favor, selecione uma cortadeira para continuar.",
            variant: "destructive",
        })
      }
  }

  const handleModalOpenChange = (isOpen: boolean) => {
    if (!isOpen && !selectedCutter) {
       setShowCutterModal(false);
       showLoader();
       router.push('/dashboard');
    } else {
        setShowCutterModal(isOpen);
    }
  };

  const filters: FilterType[] = [
    'Todos',
    'Eventos/Prioridade',
    'Lisa',
    'Bordados',
    'Sublimações',
    'Silk',
  ];
  
  if (!selectedCutter) {
    return (
        <Dialog open={showCutterModal} onOpenChange={handleModalOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Identificação</DialogTitle>
                    <DialogDescription>
                       Selecione a cortadeira para visualizar os pedidos.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cutter-select" className="text-right">
                            Cortadeira
                        </Label>
                         <Select onValueChange={(value) => setTempSelectedCutter(value as Cutter)} value={tempSelectedCutter}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione a cortadeira" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCutters.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSelectCutter}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StageHeader
        title={`Setor de Corte: ${selectedCutter}`}
        subtitle="Controle operacional de enfesto, risco e corte de peças"
        icon={Scissors}
        badgeText={selectedCutter}
        gradient="from-slate-700 via-zinc-600 to-slate-500"
        stats={{
          totalOrders: cutterAllOrders.length,
          totalPieces: cutterTotalPieces,
          priorityOrders: cutterAllOrders.filter(
            (o) => o.isPriority || o.productionType === 'Eventos/Prioridade'
          ).length,
          overdueOrders: cutterOverdueOrders,
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <LoaderLink href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 border-border hover:bg-muted/80">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </LoaderLink>
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
          <Button
            variant="outline"
            className="border-border hover:bg-muted/80"
            onClick={() => {
              setTempSelectedCutter(selectedCutter ?? '');
              setShowCutterModal(true);
            }}
          >
            <Scissors className="mr-2 h-4 w-4" />
            Trocar Cortadeira
          </Button>
        </div>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
                <TabsTrigger value="cutting">Fila de Corte</TabsTrigger>
                <TabsTrigger value="reposition" className={cn("transition-colors", repositionOrders.length > 0 && "font-bold text-red-600 data-[state=active]:text-red-700")}>
                    Reposição
                    {repositionOrders.length > 0 && (
                        <Badge variant="destructive" className="ml-2">{repositionOrders.length}</Badge>
                    )}
                </TabsTrigger>
                 <TabsTrigger value="faction">Lotes de Facção</TabsTrigger>
            </TabsList>
             <TabsContent value="cutting">
                <div className="flex flex-wrap items-center gap-2 my-4">
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
                <CuttingTable orders={cuttingQueueOrders} onStageChange={handleStageChange} mode="cutting" />
            </TabsContent>
            <TabsContent value="reposition">
                 <CuttingTable orders={repositionOrders} onStageChange={handleStageChange} mode="reposition" />
            </TabsContent>
            <TabsContent value="faction">
              <FactionLotsTable lots={productionLots} cutter={selectedCutter} onSaveLot={handleSaveLot} />
            </TabsContent>
        </Tabs>

       <Dialog open={showCutterModal && !!selectedCutter} onOpenChange={handleModalOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Trocar Cortadeira</DialogTitle>
                    <DialogDescription>
                       Selecione a cortadeira para visualizar os pedidos.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cutter-select" className="text-right">
                            Cortadeira
                        </Label>
                         <Select onValueChange={(value) => setTempSelectedCutter(value as Cutter)} value={tempSelectedCutter}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione a cortadeira" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCutters.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCutterModal(false)}>Cancelar</Button>
                    <Button onClick={handleSelectCutter}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

export default function CuttingPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <CuttingPageContent />
    </React.Suspense>
  );
}
