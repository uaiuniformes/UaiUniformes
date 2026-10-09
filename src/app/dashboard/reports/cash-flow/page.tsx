

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
import { mockCashFlowData } from '@/lib/mock-data';
import type { CashFlowTransaction, PaymentType } from '@/lib/types';
import { startOfMonth, endOfMonth, getYear, getMonth, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Printer, Eye, ArrowUpCircle, ArrowDownCircle, Search, FileText } from 'lucide-react';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { paymentMethods } from '@/components/orders/order-constants';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');


const ReportTable = ({ transactions, title, showTypeColumn = false, showCommission = false }: { transactions: CashFlowTransaction[], title?: string, showTypeColumn?: boolean, showCommission?: boolean }) => {
  const [commissionPercentage, setCommissionPercentage] = React.useState(0.5);

  const total = React.useMemo(() => {
    return transactions.reduce((acc, transaction) => acc + transaction.value, 0);
  }, [transactions]);
  
  const commissionValue = total * (commissionPercentage / 100);

  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhuma transação encontrada para os filtros aplicados.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nº</TableHead>
          {showTypeColumn && <TableHead>Tipo</TableHead>}
          <TableHead>Cliente/Origem</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Forma</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-center no-print">Ver Nota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={`${transaction.date}-${transaction.id}`}>
            <TableCell>{index + 1}</TableCell>
            {showTypeColumn && (
              <TableCell>
                <span className={cn(
                  'font-semibold',
                  transaction.type === 'Entrada' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type}
                </span>
              </TableCell>
            )}
            <TableCell className="font-medium print:py-1 print:px-2">{transaction.source}</TableCell>
            <TableCell className="font-medium print:py-1 print:px-2">{transaction.description}</TableCell>
            <TableCell className="print:py-1 print:px-2">{transaction.paymentMethod}</TableCell>
            <TableCell className="print:py-1 print:px-2">{formatDate(transaction.date)}</TableCell>
            <TableCell className="text-right print:py-1 print:px-2">{formatCurrency(transaction.value)}</TableCell>
            <TableCell className="no-print text-center">
                 {transaction?.receiptImageUrl && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                {transaction.receiptType === 'pdf' ? (
                                    <FileText className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className={cn(
                            transaction.receiptType === 'pdf' && 'h-[90vh] max-w-4xl'
                        )}>
                            <DialogHeader>
                                <DialogTitle>Comprovante</DialogTitle>
                                <DialogDescription>{transaction.description}</DialogDescription>
                            </DialogHeader>
                            {transaction.receiptType === 'pdf' ? (
                                <embed src={transaction.receiptImageUrl} type="application/pdf" className="w-full h-full" />
                            ) : (
                                <Image src={transaction.receiptImageUrl} alt={`Comprovante para ${transaction.description}`} width={500} height={500} className="rounded-md object-contain" data-ai-hint="receipt document" />
                            )}
                        </DialogContent>
                    </Dialog>
                )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {title && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={showTypeColumn ? 6 : 5} className="font-bold print:py-1 print:px-2">{title}</TableCell>
              <TableCell className="text-right font-bold print:py-1 print:px-2">{formatCurrency(total)}</TableCell>
              <TableCell className="no-print"></TableCell>
            </TableRow>
            {showCommission && (
              <>
                 <TableRow>
                    <TableCell colSpan={showTypeColumn ? 6 : 5} className="text-muted-foreground">Comissão (%)</TableCell>
                    <TableCell className="text-right">
                         <Input 
                            type="number"
                            value={commissionPercentage}
                            onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                            className="h-8 w-24 text-right ml-auto"
                            step="0.1"
                        />
                    </TableCell>
                    <TableCell className="no-print"></TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell colSpan={showTypeColumn ? 6 : 5} className="text-muted-foreground">Valor Comissão</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(commissionValue)}</TableCell>
                    <TableCell className="no-print"></TableCell>
                </TableRow>
              </>
            )}
          </TableFooter>
      )}
    </Table>
  );
};


const SchoolUniformsSummaryCard = ({ transactions, onPrint }: { transactions: CashFlowTransaction[], onPrint: (event: React.MouseEvent<HTMLButtonElement>) => void }) => {
    const [commissionPercentage, setCommissionPercentage] = React.useState(0.5);

    const summary = React.useMemo(() => {
        const schoolTransactions = transactions.filter(t => 
            t.description.toLowerCase().includes('uniformes escolares') || 
            t.description.toLowerCase().includes('uniformes') && (
                t.source.toLowerCase().includes('pref.') || 
                t.source.toLowerCase().includes('e.e.')
            )
        );

        const total = schoolTransactions.reduce((acc, t) => acc + t.value, 0);

        const byMethod = schoolTransactions.reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.value;
            return acc;
        }, {} as Record<PaymentType, number>);

        return { total, byMethod };
    }, [transactions]);
    
    const commissionValue = summary.total * (commissionPercentage / 100);

    return (
        <Card className="printable-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Resumo de Uniformes Escolares</CardTitle>
                        <CardDescription>Soma das entradas de uniformes no período.</CardDescription>
                    </div>
                     <Button onClick={onPrint} variant="outline" size="icon" className="no-print">
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    {paymentMethods.map(method => {
                        const value = summary.byMethod[method] || 0;
                        if (value === 0 && !Object.keys(summary.byMethod).includes(method)) return null;
                        return (
                           <div key={method} className="flex justify-between items-center p-1">
                                <span className="text-muted-foreground">{method}</span>
                                <span className="font-medium">{formatCurrency(value)}</span>
                            </div>
                        )
                    })}
                </div>
                 <Separator className="my-4" />
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-1 font-semibold">
                        <span>Total Uniformes</span>
                        <span className="font-bold">{formatCurrency(summary.total)}</span>
                    </div>
                    <div className="flex justify-between items-center p-1 text-muted-foreground">
                        <span>Comissão (%)</span>
                        <Input 
                            type="number"
                            value={commissionPercentage}
                            onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                            className="h-8 w-24 text-right"
                            step="0.1"
                        />
                    </div>
                     <div className="flex justify-between items-center p-1 text-muted-foreground">
                        <span>Valor Comissão</span>
                        <span className="font-bold text-green-600">{formatCurrency(commissionValue)}</span>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
};


export default function CashFlowReportPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(getMonth(new Date(2025, 7, 1)));
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [periodTransactions, setPeriodTransactions] = React.useState<CashFlowTransaction[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  
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
    
    const allTransactions = mockCashFlowData.flatMap(record => record.transactions);

    const transactions = allTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    setPeriodTransactions(transactions);
  }, [selectedMonth, selectedYear]);
  
  React.useEffect(() => {
    generateReport();
  }, [generateReport]);
  
  const applySearchFilter = (transactions: CashFlowTransaction[]) => {
      const lowercasedTerm = searchTerm.toLowerCase();
      if (!lowercasedTerm) {
        return transactions;
      }
      return transactions.filter(t => 
        t.type.toLowerCase().includes(lowercasedTerm) ||
        t.source.toLowerCase().includes(lowercasedTerm) ||
        t.description.toLowerCase().includes(lowercasedTerm) ||
        t.paymentMethod.toLowerCase().includes(lowercasedTerm) ||
        formatDate(t.date).includes(lowercasedTerm) ||
        t.value.toString().replace('.',',').includes(lowercasedTerm)
      );
  }

  const generalReportTransactions = React.useMemo(() => {
    const filtered = periodTransactions.filter(t => {
      // Exclui saídas de compensação (que terminam com *)
      return !(t.type === 'Saída' && (t.description.endsWith('*') || t.source.endsWith('*')));
    });
    return applySearchFilter(filtered);
  }, [periodTransactions, searchTerm]);


  const entryTransactions = React.useMemo(() => {
    return applySearchFilter(periodTransactions.filter(t => t.type === 'Entrada'));
  }, [periodTransactions, searchTerm]);

  const exitTransactions = React.useMemo(() => {
     return applySearchFilter(periodTransactions.filter(t => t.type === 'Saída'));
  }, [periodTransactions, searchTerm]);
  
  const handlePrint = (event: React.MouseEvent<HTMLButtonElement>) => {
    const cardToPrint = (event.currentTarget as HTMLElement).closest('.printable-card');
    if (cardToPrint) {
      document.querySelectorAll('.printable-card').forEach(card => {
        card.classList.add('no-print');
      });
      cardToPrint.classList.remove('no-print');
      cardToPrint.classList.add('print-this');
      
      window.print();
      
      setTimeout(() => {
        document.querySelectorAll('.printable-card').forEach(card => {
            card.classList.remove('no-print');
        });
        cardToPrint.classList.remove('print-this');
      }, 500);
    }
  };

  const monthName = months.find(m => m.value === selectedMonth)?.label;

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
                <CardTitle>Relatório de Caixa</CardTitle>
                <CardDescription>
                    Movimentações financeiras no período selecionado.
                </CardDescription>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <Select defaultValue="/dashboard/reports/cash-flow" onValueChange={handleReportTypeChange}>
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
      
        <Tabs defaultValue="todas" className="w-full">
            <TabsList className="mb-4 no-print">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="entradas">Entradas</TabsTrigger>
                <TabsTrigger value="saidas">Saídas</TabsTrigger>
            </TabsList>
            <TabsContent value="todas">
                <Card className="printable-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                             <div>
                                <CardTitle>Relatório Geral</CardTitle>
                                <CardDescription>Detalhe de todas as movimentações no período.</CardDescription>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="relative w-full sm:w-64 no-print">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                    type="search"
                                    placeholder="Buscar transações..."
                                    className="pl-8 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handlePrint} variant="outline" size="icon" className="no-print">
                                    <Printer className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ReportTable transactions={generalReportTransactions} showTypeColumn={true} />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="entradas">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <SchoolUniformsSummaryCard transactions={entryTransactions} onPrint={handlePrint} />
                    </div>
                    <div className="lg:col-span-2">
                        <Card className="printable-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Relatório de Entradas</CardTitle>
                                        <CardDescription>Detalhe de todas as entradas no período.</CardDescription>
                                    </div>
                                    <Button onClick={handlePrint} variant="outline" size="icon" className="no-print">
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ReportTable transactions={entryTransactions} title="Total de Entradas" showCommission={true} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="saidas">
                <Card className="printable-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                             <div>
                                <CardTitle>Relatório de Saídas</CardTitle>
                                <CardDescription>Detalhe de todas as saídas no período.</CardDescription>
                             </div>
                              <Button onClick={handlePrint} variant="outline" size="icon" className="no-print">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ReportTable transactions={exitTransactions} title="Total de Saídas" />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
    </>
  );
}
