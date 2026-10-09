

import type { orderSituations, internalResponsibles, cutters, seamstresses, artSeparationStatus, productionTypes, materials, sleeveTypes, collarTypes, additionalItems, stampTypes, deliveryMethods, paymentConditions, shirtColors, cuffColors, sleeveColors, collarColors, paymentMethods, orderModels } from "@/components/orders/order-constants";

export interface Customer {
  id: string;
  companyName: string;
  responsible: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  cnpj: string;
  cpf?: string;
  imageUrl?: string;
  city?: string;
  uf?: string;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  creationDate: string;
  expirationDate: string;
  productType: string;
  color: string;
  printType: string;
}

export type OrderStage = typeof orderSituations[number];

export type Responsible = typeof internalResponsibles[number];

export type Cutter = typeof cutters[number];

export type Seamstress = typeof seamstresses[number];

export type ArtSeparationStatus = typeof artSeparationStatus[number];

export type ProductionType = typeof productionTypes[number];

export type Material = typeof materials[number];
export type SleeveType = typeof sleeveTypes[number];
export type CollarType = typeof collarTypes[number];
export type Additional = typeof additionalItems[number];
export type StampType = typeof stampTypes[number];
export type DeliveryMethod = typeof deliveryMethods[number];
export type PaymentCondition = typeof paymentConditions[number];
export type PaymentMethod = typeof paymentMethods[number];
export type ShirtColor = typeof shirtColors[number];
export type CuffColor = typeof cuffColors[number];
export type SleeveColor = typeof sleeveColors[number];
export type CollarColor = typeof collarColors[number];

export interface LossRecord {
    date: string;
    description: string;
    stage: OrderStage;
}

export interface StageHistory {
    stage: OrderStage | 'Deletado';
    startDate: string;
    reason?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerResponsible: string;
  model: string;
  color: string[];
  type: StampType[];
  productionType?: ProductionType;
  orderDate: string;
  deliveryDate: string;
  value: number;
  quantity: number;
  stage: OrderStage | 'Deletado';
  stageHistory?: StageHistory[];
  responsible: Responsible;
  notes?: string;
  artSeparation: ArtSeparationStatus;
  imageUrls?: string[];
  notifications: boolean;
  cutter?: Cutter;
  seamstress?: Seamstress;
  isPriority?: boolean;
  material?: Material[];
  sleeveType?: SleeveType;
  collarType?: CollarType;
  additional?: Additional[];
  sizes?: Record<string, number>;
  amountPaid?: number;
  entryDate?: string;
  paymentCondition?: PaymentCondition[] | PaymentCondition;
  paymentMethod?: PaymentMethod[] | PaymentMethod;
  deliveryMethod?: DeliveryMethod;
  deliveryRecipient?: string;
  remainingAmountProofUrl?: string;
  sleeveColor?: SleeveColor[];
  cuffColor?: CuffColor[];
  collarColor?: CollarColor[];
  entryAmountProofUrl?: string;
  remainingAmountPaid?: number;
  finalPaymentDate?: string;
  status?: string; // Add this line
  lossRecords?: LossRecord[];
  lotId?: string; // ID do lote ao qual o pedido pertence
  costDetails?: OrderCostDetails;
}

export interface OrderCostDetails {
  fabricCost: number;        // Custo total de tecido / malha
  laborCost: number;         // Custo total de mão de obra (corte + costura + arremate)
  stampCost: number;         // Custo total de estampa / personalização
  accessoriesCost: number;   // Aviamentos (gola, punho, botões, embalagem)
  taxRatePercent: number;    // % de imposto (ex: 6%)
  paymentFeePercent: number; // % de taxa financeira (ex: 2.5%)
  unitCost: number;          // Custo unitário por peça (R$)
  totalCost: number;         // Custo total do lote/pedido (R$)
  netProfit: number;         // Lucro Líquido / Margem de Contribuição (R$)
  profitMarginPercent: number; // Margem de Lucro Real (%)
}

export type LotStatus = 'Pendente' | 'Enviado para Facção' | 'Recebido da Facção' | 'Concluído';


export interface ProductionLot {
  id: string;
  name: string;
  cutter: Cutter;
  orderIds: string[];
  totalPieces: number;
  creationDate: string;
  status: LotStatus;
}


export interface CutterData {
    name: string;
    value: number;
    fill: string;
}

export interface ProductionReportData {
  responsible: Responsible;
  orders: number;
  totalValue: number;
  totalQuantity: number;
}

export interface CuttingReportData {
  cutter: Cutter;
  seamstress: Seamstress;
  orders: number;
  totalQuantity: number;
}

export type OrderModel = typeof orderModels[number];

export type UserActionType = 'Login' | 'Etapa Alterada' | 'Checklist Marcado' | 'Pedido Criado' | 'Pedido Editado' | 'Pedido Cancelado' | 'Senha Alterada';

export interface UserAction {
  id: string;
  type: UserActionType;
  timestamp: string;
  description: string;
  details?: {
    orderId?: string;
    from?: string;
    to?: string;
    customer?: string;
  };
}

export type UserRole = 'Administrador' | 'Gerente' | 'Vendedor' | 'Cortadeira';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export type TransactionType = 'Entrada' | 'Saída';
export type PaymentType = typeof paymentMethods[number];

export interface CashFlowTransaction {
  id: number;
  date: string;
  source: string;
  description: string;
  paymentMethod: PaymentType;
  value: number;
  type: TransactionType;
  receiptImageUrl?: string;
  receiptType?: 'image' | 'pdf';
}

export interface DailyCashRecord {
  date: string;
  initialBalance: number;
  transactions: CashFlowTransaction[];
  balance: {
    cash: number;
    coins: number;
  };
}

export type InventoryCategory = 'Malha PV' | 'Malha PP' | 'Piquet' | 'Dryfit' | 'Moletom' | 'Outros';

export interface InventoryItem {
    id: string;
    category: InventoryCategory;
    name: string;
    color: string;
    quantity: number; // in kg
    supplier: string;
    lastUpdated: string;
}

export interface InventoryMovement {
    id: string;
    itemId: string;
    type: 'Entrada' | 'Saída';
    quantity: number;
    date: string;
    responsible: string;
    notes?: string;
}

export interface CuttingData {
    name: string;
    value: number;
    fill: string;
}

