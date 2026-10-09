
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
import type { Order, Seamstress } from '@/lib/types';
import { startOfMonth, endOfMonth, getYear, getMonth, parseISO, format } from 'date-fns';
import { seamstresses } from '@/components/orders/order-constants';
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
  { value: 10, 'label': 'Novembro' },
  { value: 11, 'label': 'Dezembro' },
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
  const getSewingConclusionDate = (order: Order) => {
      const sewingIndex = order.stageHistory?.findIndex(h => h.stage === 'Costura');
      if (sewingIndex !== undefined && sewingIndex > -1 && order.stageHistory && sewingIndex < order.stageHistory.length - 1) {
          return formatDate(order.stageHistory[sewingIndex + 1].startDate);
      }
      return 'N/A';
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum pedido costurado neste período para esta costureira.
      </div>
    );
  }

  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Conclusão</TableHead>
                <TableHead className="text-center">Qtd.</TableHead>
                <TableHead className="text-center no-print">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.map(order => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>{order.customerResponsible}</TableCell>
                    <TableCell>{order.model}</TableCell>
                    <TableCell>{getSewingConclusionDate(order)}</TableCell>
                    <TableCell className="text-center">{order.quantity}</TableCell>
                    <TableCell className="no-print text-center">
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
    </Table>
  );
};

const SewingSummaryTable = ({ 
    summaryData,
    month, 
    year,
    onPrint,
    selectedSeamstress,
}: { 
    summaryData: Record<string, Record<string, { totalQuantity: number }>>, 
    month: number, 
    year: number,
    onPrint: () => void,
    selectedSeamstress: Seamstress | 'Todas',
}) => {
    const monthName = months.find(m => m.value === month)?.label;
    const [pieceValues, setPieceValues] = React.useState<Record<string, string>>({});

    const handlePieceValueChange = (model: string, value: string) => {
        setPieceValues(prev => ({ ...prev, [model]: value }));
    };

    const handleBlur = (model: string) => {
        const value = parseFloat(pieceValues[model]?.replace(',', '.') || '0');
        if (!isNaN(value)) {
            setPieceValues(prev => ({ ...prev, [model]: value.toFixed(2).replace('.', ',') }));
        }
    };
    
    const seamstressToShow = selectedSeamstress === 'Todas' ? Object.keys(summaryData) : (summaryData[selectedSeamstress] ? [selectedSeamstress] : []);
    
    return (
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Resumo de Comissão</CardTitle>
                        <CardDescription>
                            {selectedSeamstress === 'Todas' 
                                ? `Totais para ${monthName} de ${year}` 
                                : `Totais para ${selectedSeamstress} em ${monthName} de ${year}`}
                        </CardDescription>
                    </div>
                     <Button onClick={onPrint} variant="outline" size="icon" className="print-hidden h-8 w-8">
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              {seamstressToShow.map((seamstress) => {
                  const models = summaryData[seamstress];
                  const totalCommission = Object.entries(models).reduce((total, [model, data]) => {
                      const pieceValue = parseFloat(pieceValues[`${seamstress}-${model}`]?.replace(',', '.') || '0');
                      return total + (data.totalQuantity * pieceValue);
                  }, 0);

                  return (
                    <div key={seamstress} className="mb-8 last:mb-0">
                        <h3 className="font-bold text-lg mb-2 p-2 bg-muted rounded-md">{seamstress}</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead className="text-center">Peças</TableHead>
                                    <TableHead className="w-[120px]">Valor (R$)</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(models).map(([model, data]) => {
                                    const pieceValue = parseFloat(pieceValues[`${seamstress}-${model}`]?.replace(',', '.') || '0');
                                    const commission = data.totalQuantity * pieceValue;

                                    return (
                                        <TableRow key={model}>
                                            <TableCell className="font-medium">{model}</TableCell>
                                            <TableCell className="text-center">{data.totalQuantity}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="text" 
                                                    className="h-8 print-hidden"
                                                    placeholder="0,00"
                                                    value={pieceValues[`${seamstress}-${model}`] || ''}
                                                    onChange={(e) => handlePieceValueChange(`${seamstress}-${model}`, e.target.value)}
                                                    onBlur={() => handleBlur(`${seamstress}-${model}`)}
                                                />
                                                <span className="hidden print:block">{pieceValues[`${seamstress}-${model}`]?.replace('.', ',') || '0,00'}</span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(commission)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">Total a Pagar</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(totalCommission)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                  );
              })}
              {seamstressToShow.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    Nenhum dado de resumo para a seleção.
                </div>
              )}
            </CardContent>
        </Card>
    );
};


export default function SewingReportPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(getMonth(new Date(2025, 5, 1)));
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [selectedSeamstress, setSelectedSeamstress] = React.useState<Seamstress | 'Todas'>('Todas');
  
  const [ordersBySeamstress, setOrdersBySeamstress] = React.useState<Record<string, Order[]>>({});
  const [summaryData, setSummaryData] = React.useState<Record<string, Record<string, { totalQuantity: number }>>>({});
  
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
      if (!order.stageHistory || !order.seamstress) return false;
      const sewingIndex = order.stageHistory.findIndex(h => h.stage === 'Costura');
      if (sewingIndex === -1) return false;
      
      const sewingConclusionIndex = sewingIndex + 1;
      if (sewingConclusionIndex < order.stageHistory.length) {
          const conclusionDate = parseISO(order.stageHistory[sewingConclusionIndex].startDate);
          return conclusionDate >= startDate && conclusionDate <= endDate;
      }
      return false;
    });

    const groupedBySeamstress = periodOrders.reduce((acc, order) => {
        const seamstress = order.seamstress!;
        if (!acc[seamstress]) {
            acc[seamstress] = [];
        }
        acc[seamstress].push(order);
        return acc;
    }, {} as Record<string, Order[]>);
    setOrdersBySeamstress(groupedBySeamstress);
    
    const calculatedSummary = Object.keys(groupedBySeamstress).reduce((acc, seamstress) => {
        const seamstressOrders = groupedBySeamstress[seamstress];
        const summaryByModel = seamstressOrders.reduce((modelAcc, order) => {
            const model = order.model;
            if (!modelAcc[model]) {
                modelAcc[model] = { totalQuantity: 0 };
            }
            modelAcc[model].totalQuantity += order.quantity;
            return modelAcc;
        }, {} as Record<string, { totalQuantity: number }>);
        acc[seamstress] = summaryByModel;
        return acc;
    }, {} as Record<string, Record<string, { totalQuantity: number }>>);
    setSummaryData(calculatedSummary);
    
  }, [selectedMonth, selectedYear]);
  
  React.useEffect(() => {
    generateReport();
  }, [generateReport]);

  const seamstressesWithOrders = React.useMemo(() => {
    return seamstresses.filter(s => ordersBySeamstress[s] && ordersBySeamstress[s].length > 0);
  }, [ordersBySeamstress]);
  
  const handlePrint = (section: 'summary' | 'details') => {
    document.body.classList.add(`printing-${section}`);
    window.print();
    setTimeout(() => {
        document.body.classList.remove(`printing-${section}`);
    }, 500);
  };
  
  const detailedOrders = React.useMemo(() => {
      if (selectedSeamstress === 'Todas') {
          return Object.values(ordersBySeamstress).flat();
      }
      return ordersBySeamstress[selectedSeamstress] || [];
  }, [selectedSeamstress, ordersBySeamstress]);

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
                        <CardTitle>Relatório de Costura</CardTitle>
                        <CardDescription>
                            Peças concluídas na costura no período selecionado.
                        </CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                    <Select defaultValue="/dashboard/reports/sewing" onValueChange={handleReportTypeChange}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                     {Object.keys(summaryData).length > 0 ? (
                        <SewingSummaryTable 
                            summaryData={summaryData} 
                            month={selectedMonth} 
                            year={selectedYear} 
                            onPrint={() => handlePrint('summary')}
                            selectedSeamstress={selectedSeamstress}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-4 text-center text-muted-foreground h-full flex items-center justify-center">
                                Nenhum dado de resumo para o período.
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
                                    <CardDescription>Lista de pedidos costurados no período.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={selectedSeamstress} onValueChange={(value) => setSelectedSeamstress(value as Seamstress | 'Todas')}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrar costureira..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Todas">Todas as Costureiras</SelectItem>
                                            {seamstressesWithOrders.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
            
        </div>
        <div className='print-summary'>
          <SewingSummaryTable 
              summaryData={summaryData} 
              month={selectedMonth} 
              year={selectedYear} 
              onPrint={() => {}}
              selectedSeamstress={selectedSeamstress}
          />
        </div>
        <div className='print-details'>
            {selectedSeamstress !== 'Todas' && ordersBySeamstress[selectedSeamstress] && (
                <>
                <h2 className="text-lg font-bold mb-2">Relatório de Costura Detalhado - {selectedSeamstress}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Período: {months.find(m => m.value === selectedMonth)?.label} de {selectedYear}
                </p>
                <ReportTable orders={ordersBySeamstress[selectedSeamstress]} />
                </>
            )}
            {selectedSeamstress === 'Todas' && detailedOrders.length > 0 && (
                 <>
                    <h2 className="text-lg font-bold mb-2">Relatório de Costura Detalhado - Todas</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Período: {months.find(m => m.value === selectedMonth)?.label} de {selectedYear}
                    </p>
                    <ReportTable orders={detailedOrders} />
                 </>
            )}
        </div>
    </>
  );
}
