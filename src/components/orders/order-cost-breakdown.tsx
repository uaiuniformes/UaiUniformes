'use client';

import React from 'react';
import type { OrderCostDetails } from '@/lib/types';
import { getProfitMarginBadge } from '@/lib/cost-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Scissors, Shirt, Sparkles, Tag, ShieldAlert } from 'lucide-react';

interface OrderCostBreakdownProps {
  costDetails?: OrderCostDetails;
  totalValue: number;
  quantity: number;
  className?: string;
  isEditable?: boolean;
  onCostChange?: (costs: Partial<OrderCostDetails>) => void;
}

export function OrderCostBreakdown({
  costDetails,
  totalValue,
  quantity,
  className,
}: OrderCostBreakdownProps) {
  if (!costDetails) return null;

  const qty = Math.max(1, quantity || 1);
  const badgeInfo = getProfitMarginBadge(costDetails.profitMarginPercent);
  const isHealthy = costDetails.profitMarginPercent >= 15;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <Card className={`border shadow-sm bg-gradient-to-br from-slate-50 via-white to-gray-50 ${className || ''}`}>
      <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Custos & Rentabilidade do Pedido</CardTitle>
              <p className="text-xs text-muted-foreground">Exclusivo para gestão e produção geral</p>
            </div>
          </div>
          <Badge className={`px-2.5 py-1 text-xs font-semibold border ${badgeInfo.colorClass}`}>
            {badgeInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6 pb-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-3 rounded-lg border bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Valor de Venda
            </span>
            <span className="text-base sm:text-lg font-bold text-gray-900 block mt-0.5">
              {formatBRL(totalValue)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatBRL(totalValue / qty)} / peça
            </span>
          </div>

          <div className="p-3 rounded-lg border bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Custo de Produção
            </span>
            <span className="text-base sm:text-lg font-bold text-gray-700 block mt-0.5">
              {formatBRL(costDetails.totalCost)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatBRL(costDetails.unitCost)} / peça
            </span>
          </div>

          <div className="p-3 rounded-lg border bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Lucro Líquido Real
            </span>
            <span className={`text-base sm:text-lg font-bold block mt-0.5 ${costDetails.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatBRL(costDetails.netProfit)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatBRL(costDetails.netProfit / qty)} / peça
            </span>
          </div>

          <div className="p-3 rounded-lg border bg-white shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Margem de Lucro
            </span>
            <span className={`text-base sm:text-lg font-bold block mt-0.5 ${costDetails.profitMarginPercent >= 30 ? 'text-emerald-600' : costDetails.profitMarginPercent >= 15 ? 'text-amber-600' : 'text-rose-600'}`}>
              {costDetails.profitMarginPercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              Sobre o faturamento
            </span>
          </div>
        </div>

        <Separator />

        {/* Detalhamento dos Custos Diretos e Indiretos */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Composição Detalhada dos Custos
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-md bg-white border">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Shirt className="h-3.5 w-3.5 text-blue-600" />
                Tecido / Malha
              </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatBRL(costDetails.fabricCost)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-white border">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Scissors className="h-3.5 w-3.5 text-amber-600" />
                Mão de Obra (Corte/Costura)
              </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatBRL(costDetails.laborCost)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-white border">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                Estamparia / DTF
              </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatBRL(costDetails.stampCost)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-white border">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Tag className="h-3.5 w-3.5 text-indigo-600" />
                Aviamentos & Embalagem
              </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatBRL(costDetails.accessoriesCost)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-white border sm:col-span-2 md:col-span-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                Deduções (Impostos {costDetails.taxRatePercent}% + Taxas Financeiras {costDetails.paymentFeePercent}%)
              </span>
              <span className="font-semibold text-gray-800 font-mono">
                {formatBRL(totalValue * ((costDetails.taxRatePercent + costDetails.paymentFeePercent) / 100))}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnóstico da Rentabilidade */}
        <div className={`p-2.5 rounded-md text-xs flex items-center gap-2 border ${isHealthy ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : 'bg-amber-50/70 border-amber-200 text-amber-900'}`}>
          {!isHealthy ? (
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          ) : (
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
          )}
          <span>
            {costDetails.profitMarginPercent >= 30
              ? 'Excelente margem de contribuição. O pedido cobrirá os custos de produção e contribuirá fortemente para o lucro líquido da empresa.'
              : costDetails.profitMarginPercent >= 15
              ? 'Margem equilibrada dentro da média padrão da confecção.'
              : 'Atenção com retrabalhos ou perdas de tecido: a margem deste pedido está apertada.'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
