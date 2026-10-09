

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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockOrders } from '@/lib/mock-data';
import type { Order, Responsible } from '@/lib/types';
import { startOfMonth, endOfMonth, getYear, getMonth, parseISO, format } from 'date-fns';
import { internalResponsibles } from '@/components/orders/order-constants';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Printer, Eye } from 'lucide-react';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
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
        acc.totalValue += order.value;
        acc.totalQuantity += order.quantity;
        return acc;
      },
      { totalValue: 0, totalQuantity: 0 }
    );
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum pedido entregue neste período para este responsável.
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
          <TableHead className="text-center">Peças</TableHead>
          <TableHead className="text-right">Valor</TableHead>
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
            <TableCell className="text-right print:py-1 print:px-2">{formatCurrency(order.value)}</TableCell>
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
          <TableCell className="text-right font-bold print:py-1 print:px-2">{formatCurrency(totals.totalValue)}</TableCell>
          <TableCell className="print-hidden"></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

const SalesSummaryTable = ({ summaryData, month, year, onPrint, selectedResponsible }: { summaryData: Record<string, { totalValue: number, totalQuantity: number }>, month: number, year: number, onPrint: () => void, selectedResponsible: Responsible | 'Todos' }) => {
    const monthName = months.find(m => m.value === month)?.label;

    const dataToShow: [string, { totalValue: number, totalQuantity: number }][] = React.useMemo(() => {
      if (selectedResponsible === 'Todos') {
        return Object.entries(summaryData);
      }
      return summaryData[selectedResponsible] ? [[selectedResponsible, summaryData[selectedResponsible]]] : [];
    }, [summaryData, selectedResponsible]);

    const grandTotal = React.useMemo(() => {
        return Object.values(summaryData).reduce((acc, data) => {
            acc.totalQuantity += data.totalQuantity;
            acc.totalValue += data.totalValue;
            return acc;
        }, { totalValue: 0, totalQuantity: 0 });
    }, [summaryData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Resumo de Vendas</CardTitle>
                        <CardDescription>
                            {selectedResponsible === 'Todos' ? `Totais para ${monthName} de ${year}` : `Totais de ${selectedResponsible}`}
                        </CardDescription>
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
                            <TableHead>Vendedor</TableHead>
                            <TableHead className="text-center">Peças</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataToShow.length > 0 ? dataToShow.map(([responsible, data]) => (
                            <TableRow key={responsible}>
                                <TableCell className="font-medium print:py-1 print:px-2">{responsible}</TableCell>
                                <TableCell className="text-center print:py-1 print:px-2">{data.totalQuantity}</TableCell>
                                <TableCell className="text-right print:py-1 print:px-2">{formatCurrency(data.totalValue)}</TableCell>
                            </TableRow>
                        )) : (
                           <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">Nenhum dado para o vendedor selecionado.</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                     {selectedResponsible === 'Todos' && dataToShow.length > 0 && (
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Total Geral</TableCell>
                                <TableCell className="text-center font-bold">{grandTotal.totalQuantity}</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(grandTotal.totalValue)}</TableCell>
                            </TableRow>
                        </TableFooter>
                     )}
                </Table>
            </CardContent>
        </Card>
    );
}


export default function ProductionReportPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(getMonth(new Date(2025, 5, 1)));
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [ordersByResponsible, setOrdersByResponsible] = React.useState<Record<string, Order[]>>({});
  const [summaryData, setSummaryData] = React.useState<Record<string, { totalValue: number, totalQuantity: number }>>({});
  const [selectedResponsible, setSelectedResponsible] = React.useState<Responsible | 'Todos'>('Todos');

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
      if (order.stage !== 'Entregue') return false;
      const deliveryDate = new Date(order.deliveryDate);
      return deliveryDate >= startDate && deliveryDate <= endDate;
    });

    const groupedOrders = periodOrders.reduce((acc, order) => {
      const responsible = order.responsible;
      if (!acc[responsible]) {
        acc[responsible] = [];
      }
      acc[responsible].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
    
    const calculatedSummary = Object.keys(groupedOrders).reduce((acc, responsible) => {
        const totals = groupedOrders[responsible].reduce((sum, order) => {
            sum.totalValue += order.value;
            sum.totalQuantity += order.quantity;
            return sum;
        }, { totalValue: 0, totalQuantity: 0 });
        acc[responsible] = totals;
        return acc;
    }, {} as Record<string, { totalValue: number, totalQuantity: number }>);

    setOrdersByResponsible(groupedOrders);
    setSummaryData(calculatedSummary);
    // Não resetar o filtro aqui, manter a seleção do usuário se possível
    // setSelectedResponsible('Todos'); 
  }, [selectedMonth, selectedYear]);
  
  React.useEffect(() => {
    generateReport();
  }, [generateReport]);

  const responsiblesWithOrders = React.useMemo(() => 
    internalResponsibles.filter(r => ordersByResponsible[r] && ordersByResponsible[r].length > 0),
    [ordersByResponsible]
  );
  
  const handlePrint = (section: 'summary' | 'details') => {
    document.body.classList.add(`printing-${section}`);
    window.print();
    setTimeout(() => {
        document.body.classList.remove(`printing-${section}`);
    }, 500);
  };
  
  const detailedOrders = React.useMemo(() => {
      if (selectedResponsible === 'Todos') {
          return Object.values(ordersByResponsible).flat().sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
      }
      return ordersByResponsible[selectedResponsible] || [];
  }, [selectedResponsible, ordersByResponsible]);


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
                <CardTitle>Relatório de Vendas</CardTitle>
                <CardDescription>
                    Pedidos entregues no período selecionado.
                </CardDescription>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <Select defaultValue="/dashboard/reports/production" onValueChange={handleReportTypeChange}>
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
                <SalesSummaryTable 
                    summaryData={summaryData} 
                    month={selectedMonth} 
                    year={selectedYear} 
                    onPrint={() => handlePrint('summary')} 
                    selectedResponsible={selectedResponsible}
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
                            <CardDescription>Lista de pedidos entregues no período.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Select value={selectedResponsible} onValueChange={(value) => setSelectedResponsible(value as Responsible | 'Todos')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar vendedor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Todos">Todos os Vendedores</SelectItem>
                                    {responsiblesWithOrders.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
        <SalesSummaryTable 
            summaryData={summaryData} 
            month={selectedMonth} 
            year={selectedYear} 
            onPrint={() => {}} 
            selectedResponsible={selectedResponsible}
        />
      </div>
      <div className='print-details'>
         {selectedResponsible && detailedOrders.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-2">Relatório de Vendas Detalhado - {selectedResponsible}</h2>
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
