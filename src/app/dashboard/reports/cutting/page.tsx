

'use client';

import * as React from 'react';
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
  TableFooter,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockOrders } from '@/lib/mock-data';
import type { Order, Cutter } from '@/lib/types';
import { startOfMonth, endOfMonth, getYear, getMonth, parseISO, format } from 'date-fns';
import { cutters } from '@/components/orders/order-constants';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Printer, Eye } from 'lucide-react';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { Input } from '@/components/ui/input';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';

const months = [
  { value: 0, label: 'Janeiro' },
  { value: 1, label: 'Fevereiro' },
  { value: 2, label: 'Março' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Maio' },
  { value: 5, label: 'Junho' },
  { value: 6, label: 'Julho' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Setembro' },
  { value: 9, label: 'Outubro' },
  { value: 10, label: 'Novembro' },
  { value: 11, label: 'Dezembro' },
];

const currentYear = getYear(new Date(2025, 0, 1));
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateString: string) => {
    if(!dateString) return 'N/A';
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy');
};

const ReportTable = ({ orders }: { orders: Order[] }) => {
  const totals = React.useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.totalQuantity += order.quantity;
        return acc;
      },
      { totalQuantity: 0 }
    );
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum pedido cortado neste período para esta cortadeira.
      </div>
    );
  }

  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Entrega</TableHead>
                <TableHead className="text-center">Qtd. Peças</TableHead>
                <TableHead className="text-center no-print">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.map(order => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium print:py-1 print:px-2">{order.customerName}</TableCell>
                    <TableCell className="print:py-1 print:px-2">{order.customerResponsible}</TableCell>
                    <TableCell className="print:py-1 print:px-2">{formatDate(order.deliveryDate)}</TableCell>
                    <TableCell className="text-center print:py-1 print:px-2">{order.quantity}</TableCell>
                    <TableCell className="print-hidden text-center">
                         <OrderDetailsDialog
                            orderId={order.id}
                            trigger={
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
        <TableFooter>
            <TableRow>
                <TableCell colSpan={3} className="font-bold print:py-1 print:px-2">Total</TableCell>
                <TableCell className="text-center font-bold print:py-1 print:px-2">{totals.totalQuantity}</TableCell>
                <TableCell className="print-hidden"></TableCell>
            </TableRow>
        </TableFooter>
    </Table>
  );
};

const CuttingSummaryTable = ({ 
    summaryData,
    cutter,
    month, 
    year,
    onPrint,
}: { 
    summaryData: Record<string, { totalQuantity: number }>, 
    cutter: Cutter | 'Todas',
    month: number, 
    year: number,
    onPrint: () => void,
}) => {
    const monthName = months.find(m => m.value === month)?.label;
    const [pieceValues, setPieceValues] = React.useState<Record<string, string>>({
        'Magda': '1.00', 'Cortador Terceirizado': '1.00', 'A Laser': '1.00', 'Ilma Maria': '1.00'
    });

    const handlePieceValueChange = (cutter: string, value: string) => {
        setPieceValues(prev => ({ ...prev, [cutter]: value }));
    };

    const handleBlur = (cutter: string) => {
        const value = parseFloat(pieceValues[cutter]?.replace(',', '.') || '0');
        if (!isNaN(value)) {
            setPieceValues(prev => ({ ...prev, [cutter]: value.toFixed(2).replace('.', ',') }));
        }
    };

    const dataToShow: [string, { totalQuantity: number }][] = cutter === 'Todas' ? Object.entries(summaryData) : (summaryData[cutter] ? [[cutter, summaryData[cutter]]] : []);
    
    return (
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Resumo de Comissão</CardTitle>
                        <CardDescription>{cutter} - {monthName} de {year}</CardDescription>
                    </div>
                    <Button onClick={onPrint} variant="outline" size="icon" className="print-hidden h-8 w-8">
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cortadeira</TableHead>
                            <TableHead className="text-center">Peças</TableHead>
                            <TableHead className="w-[120px]">Valor (R$)</TableHead>
                            <TableHead className="text-right">Comissão</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataToShow.map(([cutterName, data]) => {
                            const pieceValue = parseFloat(pieceValues[cutterName]?.replace(',', '.') || '0');
                            const commission = data.totalQuantity * pieceValue;

                            return (
                                <TableRow key={cutterName}>
                                    <TableCell className="font-medium print:py-1 print:px-2">{cutterName}</TableCell>
                                    <TableCell className="text-center print:py-1 print:px-2">{data.totalQuantity}</TableCell>
                                    <TableCell className="print:py-1 print:px-2">
                                        <Input 
                                            type="text" 
                                            className="h-8 print-hidden"
                                            placeholder="0,00"
                                            value={pieceValues[cutterName] || ''}
                                            onChange={(e) => handlePieceValueChange(cutterName, e.target.value)}
                                            onBlur={() => handleBlur(cutterName)}
                                        />
                                        <span className="hidden print:block">{pieceValues[cutterName]?.replace('.', ',') || '0,00'}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium print:py-1 print:px-2">{formatCurrency(commission)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    {cutter === 'Todas' && (
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-bold">Total Geral</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(
                                    dataToShow.reduce((total, [cutterName, data]) => {
                                        const pieceValue = parseFloat(pieceValues[cutterName]?.replace(',', '.') || '0');
                                        return total + (data.totalQuantity * pieceValue);
                                    }, 0)
                                )}</TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </CardContent>
        </Card>
    );
};


export default function CuttingReportPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(getMonth(new Date(2025, 5, 1)));
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [selectedCutter, setSelectedCutter] = React.useState<Cutter | 'Todas'>('Todas');

  const [ordersByCutter, setOrdersByCutter] = React.useState<Record<string, Order[]>>({});
  const [summaryData, setSummaryData] = React.useState<Record<string, { totalQuantity: number }>>({});
  
  const router = useRouter();
  const { showLoader } = useLoader();

  const handleBackClick = () => {
    showLoader();
    router.back();
  };
  
  const handleReportTypeChange = (value: string) => {
    showLoader();
    router.push(value);
  }

  const generateReport = React.useCallback(() => {
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth));

    const periodOrders = mockOrders.filter(order => {
      if (!order.stageHistory || !order.cutter) return false;
      const cuttingIndex = order.stageHistory.findIndex(h => h.stage === 'Corte');
      if (cuttingIndex === -1) return false;

      const cuttingConclusionIndex = cuttingIndex + 1;
      if (cuttingConclusionIndex < order.stageHistory.length) {
         const conclusionDate = parseISO(order.stageHistory[cuttingConclusionIndex].startDate);
         return conclusionDate >= startDate && conclusionDate <= endDate;
      }
      
      return false;
    });

    const groupedOrders = periodOrders.reduce((acc, order) => {
        const cutter = order.cutter!;
        if (!acc[cutter]) {
            acc[cutter] = [];
        }
        acc[cutter].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

     const calculatedSummary = Object.keys(groupedOrders).reduce((acc, cutter) => {
        const totalQuantity = groupedOrders[cutter].reduce((sum, order) => sum + order.quantity, 0);
        acc[cutter] = { totalQuantity };
        return acc;
    }, {} as Record<string, { totalQuantity: number }>);
    
    setOrdersByCutter(groupedOrders);
    setSummaryData(calculatedSummary);

    const firstCutterWithOrders = cutters.find(c => groupedOrders[c] && groupedOrders[c].length > 0);
    setSelectedCutter(firstCutterWithOrders || 'Todas');
  }, [selectedMonth, selectedYear]);
  
  React.useEffect(() => {
    generateReport();
  }, [generateReport]);

  const cuttersWithOrders = React.useMemo(() => 
    cutters.filter(c => ordersByCutter[c] && ordersByCutter[c].length > 0),
    [ordersByCutter]
  );
  
  const handlePrint = (section: 'summary' | 'details') => {
    document.body.classList.add(`printing-${section}`);
    window.print();
    setTimeout(() => {
        document.body.classList.remove(`printing-${section}`);
    }, 500);
  };
  
  const detailedOrders = React.useMemo(() => {
      if (selectedCutter === 'Todas') {
          return Object.values(ordersByCutter).flat();
      }
      return ordersByCutter[selectedCutter] || [];
  }, [selectedCutter, ordersByCutter]);

  return (
    <>
    <div className="flex flex-col gap-6">
      <Card className="no-print">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <Button onClick={handleBackClick} variant="outline" size="icon" className="h-8 w-8 mb-1">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <LoaderLink href="/dashboard">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Home className="h-4 w-4" />
                        </Button>
                    </LoaderLink>
                </div>
                <div>
                <CardTitle>Relatório de Corte</CardTitle>
                <CardDescription>
                    Peças cortadas no período selecionado.
                </CardDescription>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <Select defaultValue="/dashboard/reports/cutting" onValueChange={handleReportTypeChange}>
                 <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Relatório" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="/dashboard/reports/production">Vendas</SelectItem>
                    <SelectItem value="/dashboard/reports/cutting">Corte</SelectItem>
                    <SelectItem value="/dashboard/reports/sewing">Costura</SelectItem>
                    <SelectItem value="/dashboard/reports/cash-flow">Caixa</SelectItem>
                 </SelectContent>
              </Select>
              <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        <div className="lg:col-span-1">
            {Object.keys(summaryData).length > 0 ? (
                <CuttingSummaryTable 
                    summaryData={summaryData} 
                    cutter={selectedCutter}
                    month={selectedMonth} 
                    year={selectedYear} 
                    onPrint={() => handlePrint('summary')} 
                />
            ) : (
                <Card>
                    <CardContent className="p-4 text-center text-muted-foreground h-full flex items-center justify-center">
                        Nenhum dado de resumo para o período selecionado.
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Pedidos Detalhados</CardTitle>
                            <CardDescription>Lista de pedidos cortados no período.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Select value={selectedCutter} onValueChange={(value) => setSelectedCutter(value as Cutter | 'Todas')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar costureira..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Todas">Todas as Cortadeiras</SelectItem>
                                    {cuttersWithOrders.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Button onClick={() => handlePrint('details')} variant="outline" size="icon" className="print-hidden h-8 w-8">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ReportTable orders={detailedOrders} />
                </CardContent>
            </Card>
        </div>
      </div>


      <div className='print-summary'>
         <CuttingSummaryTable 
            summaryData={summaryData} 
            cutter={selectedCutter}
            month={selectedMonth} 
            year={selectedYear} 
            onPrint={() => {}}
        />
      </div>

      <div className='print-details'>
         {(selectedCutter !== 'Todas' && ordersByCutter[selectedCutter]) && (
            <>
              <h2 className="text-lg font-bold mb-2">Relatório de Corte Detalhado - {selectedCutter}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Período: {months.find(m => m.value === selectedMonth)?.label} de {selectedYear}
              </p>
              <ReportTable orders={detailedOrders} />
            </>
          )}
      </div>
    </div>
    </>
  );
}
