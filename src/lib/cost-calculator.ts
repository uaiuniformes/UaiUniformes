import type { Order, OrderCostDetails } from './types';

// Tabelas de Custos Médios Padrão para Confecção de Uniformes
export const DEFAULT_COST_RATES = {
  // Custo unitário de tecido por peça (baseado em consumo médio e preço por kg)
  fabricByMaterial: {
    'Malha PV': 9.50,
    'Malha PP': 8.20,
    'Piquet': 15.30,
    'Piquet PV': 14.50,
    'Dryfit': 10.50,
    'JumpDry': 11.50,
    'Polimida Lisa': 16.00,
    'Poliamida CrepICe': 17.50,
    'Poliamida Solution': 18.00,
    'Brim leve': 16.00,
    'Brim pesado': 20.00,
    'Terbrim': 18.00,
    'Tactel Wave': 11.00,
    'Tactel Soft Plus': 12.50,
    'Helanca': 12.00,
    'Oxford': 9.80,
    'Gabardine': 16.50,
    'TwoWay': 19.00,
    'Moletom': 26.00,
  } as Record<string, number>,

  // Custo de mão de obra direta (Corte + Costura + Arremate/Limpeza) por modelo
  laborByModel: {
    'Tradicional': 4.80,
    'Regata': 4.20,
    'Polo': 8.50,
    'Portuguesa': 8.00,
    'Padre': 8.20,
    'Esporte': 6.50,
    'Social': 14.00,
    'Colete Simples': 6.00,
    'Colete Dupla Face': 10.50,
    'Jaqueta': 18.00,
    'Bobojaco': 24.00,
    'Guarda Pó': 12.00,
    'Moletom': 14.00,
    'Jaleco': 13.00,
    'Pijama Cirurgico': 11.00,
    'Calça': 9.00,
    'Bermuda': 7.00,
    'Short': 6.00,
    'Avental Pescoço': 4.50,
    'Avental 1/2 Cintura': 3.80,
  } as Record<string, number>,

  // Custo de estamparia por peça
  stampByType: {
    'Lisa': 0.00,
    'Silk': 2.50,
    'Silk Digital (DTF)': 6.00,
    'Policromia': 4.50,
    'Bordado': 5.50,
    'Sublimação Total Frente': 7.50,
    'Sublimação Total Costas': 7.50,
    'Sublimação Camisa Total': 14.00,
    'Sublimação Total Mangas': 4.50,
    'Sublimação Parcial A3': 4.80,
    'Sublimação Parcial A4': 3.20,
  } as Record<string, number>,

  // Aviamentos médios (Golas polo, punhos, botões, saquinho individual, etiquetas)
  accessoriesByModel: {
    'Polo': 4.50, // Gola retilínea + punhos + botões
    'Portuguesa': 4.00,
    'Social': 3.50,
    'Jaqueta': 6.50, // Zíper + elásticos
  } as Record<string, number>,

  defaultTaxPercent: 5.5,      // Média Simples Nacional
  defaultPaymentFeePercent: 2.5, // Média taxa de cartão/antecipação
  defaultGeneralAccessory: 1.20, // Linha, etiqueta, tag e saquinho
};

/**
 * Calcula a composição de custos e lucratividade de um pedido
 */
export function calculateOrderCosts(params: {
  model?: string;
  material?: string | string[];
  stampTypes?: string[];
  quantity?: number;
  totalValue?: number;
  customFabricCost?: number;
  customLaborCost?: number;
  customStampCost?: number;
  customAccessoriesCost?: number;
  taxRatePercent?: number;
  paymentFeePercent?: number;
}): OrderCostDetails {
  const quantity = Math.max(1, params.quantity || 1);
  const totalValue = params.totalValue || 0;
  const model = params.model || 'Tradicional';
  const matName = Array.isArray(params.material) ? params.material[0] : params.material || 'Malha PV';
  const stamps = params.stampTypes && params.stampTypes.length > 0 ? params.stampTypes : ['Silk'];

  // Custo Unitário de Tecido
  const unitFabric = params.customFabricCost !== undefined 
    ? params.customFabricCost / quantity 
    : (DEFAULT_COST_RATES.fabricByMaterial[matName] ?? 10.00);

  // Custo Unitário de Mão de Obra
  const unitLabor = params.customLaborCost !== undefined 
    ? params.customLaborCost / quantity 
    : (DEFAULT_COST_RATES.laborByModel[model] ?? 5.00);

  // Custo Unitário de Estampa (soma das técnicas aplicadas)
  let unitStamp = 0;
  if (params.customStampCost !== undefined) {
    unitStamp = params.customStampCost / quantity;
  } else {
    unitStamp = stamps.reduce((acc, st) => acc + (DEFAULT_COST_RATES.stampByType[st] ?? 3.00), 0);
  }

  // Custo Unitário de Aviamentos e Embalagem
  const unitAccessories = params.customAccessoriesCost !== undefined 
    ? params.customAccessoriesCost / quantity 
    : ((DEFAULT_COST_RATES.accessoriesByModel[model] ?? 0) + DEFAULT_COST_RATES.defaultGeneralAccessory);

  // Custos totais diretos
  const totalFabric = unitFabric * quantity;
  const totalLabor = unitLabor * quantity;
  const totalStamp = unitStamp * quantity;
  const totalAccessories = unitAccessories * quantity;

  // Impostos e Taxas Financeiras
  const taxRate = params.taxRatePercent !== undefined ? params.taxRatePercent : DEFAULT_COST_RATES.defaultTaxPercent;
  const feeRate = params.paymentFeePercent !== undefined ? params.paymentFeePercent : DEFAULT_COST_RATES.defaultPaymentFeePercent;
  const totalDeductions = totalValue * ((taxRate + feeRate) / 100);

  // Custo Total e Unitário
  const totalCost = totalFabric + totalLabor + totalStamp + totalAccessories + totalDeductions;
  const unitCost = quantity > 0 ? totalCost / quantity : 0;

  // Lucro Líquido
  const netProfit = totalValue - totalCost;
  const profitMarginPercent = totalValue > 0 ? (netProfit / totalValue) * 100 : 0;

  return {
    fabricCost: Math.round(totalFabric * 100) / 100,
    laborCost: Math.round(totalLabor * 100) / 100,
    stampCost: Math.round(totalStamp * 100) / 100,
    accessoriesCost: Math.round(totalAccessories * 100) / 100,
    taxRatePercent: taxRate,
    paymentFeePercent: feeRate,
    unitCost: Math.round(unitCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
  };
}

/**
 * Retorna classe e cor de status da margem de lucro
 */
export function getProfitMarginBadge(marginPercent: number): {
  label: string;
  colorClass: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (marginPercent >= 30) {
    return {
      label: `${marginPercent.toFixed(1)}% Margem Alta`,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      badgeVariant: 'default',
    };
  }
  if (marginPercent >= 15) {
    return {
      label: `${marginPercent.toFixed(1)}% Margem Normal`,
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      badgeVariant: 'secondary',
    };
  }
  return {
    label: `${marginPercent.toFixed(1)}% Margem Baixa`,
    colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
    badgeVariant: 'destructive',
  };
}
