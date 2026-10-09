

import type { Customer, Quote, Order, StageHistory, Responsible, OrderStage, UserAction, DailyCashRecord, User, UserRole, ProductionLot, InventoryItem, InventoryMovement } from './types';
import { subDays, startOfWeek, endOfWeek, isWithinInterval, subHours, subMinutes, addDays } from 'date-fns';
import { internalResponsibles, cutters, orderSituations } from '@/components/orders/order-constants';

const today = new Date();

export const mockCustomers: Customer[] = [
  { id: 'CUST001', companyName: 'Stark Industries', responsible: 'Tony Stark', role: 'CEO', email: 'tony@stark.com', phone: '11987654321', address: '10880 Malibu Point, 90265', cnpj: '12.345.678/0001-99', city: 'EUA', uf: '' },
  { id: 'CUST002', companyName: 'Wayne Enterprises', responsible: 'Bruce Wayne', role: 'President', email: 'bruce@wayne.com', phone: '21912345678', address: '1007 Mountain Drive, Gotham', cnpj: '98.765.432/0001-11', city: 'EUA', uf: '' },
  { id: 'CUST003', companyName: 'Daily Planet', responsible: 'Lois Lane', role: 'Journalist', email: 'lois@dailyplanet.com', phone: '41999887766', address: 'Metropolis', cnpj: '11.222.333/0001-44', city: 'Caratinga', uf: 'MG' },
  { id: 'CUST004', companyName: 'Empresa A', responsible: 'Responsável A', role: 'Gerente', email: 'contato@empresa-a.com', phone: '11111111111', address: 'Endereço A', cnpj: '00.000.000/0001-00', city: 'Caratinga', uf: 'MG'},
  { id: 'CUST005', companyName: 'Empresa B', responsible: 'Responsável B', role: 'Diretor', email: 'contato@empresa-b.com', phone: '22222222222', address: 'Endereço B', cnpj: '11.111.111/0001-11', city: 'Inhapim', uf: 'MG'},
  { id: 'CUST006', companyName: 'Empresa C', responsible: 'Responsável C', role: 'Analista', email: 'contato@empresa-c.com', phone: '33333333333', address: 'Endereço C', cnpj: '22.222.222/0001-22', city: 'Iapu', uf: 'MG'},
  { id: 'CUST007', companyName: 'Stark Industries', responsible: 'Pepper Potts', role: 'CFO', email: 'pepper@stark.com', phone: '11912345678', address: '10880 Malibu Point, 90265', cnpj: '12.345.678/0001-99', city: 'Eua', uf: '' },
];

export const mockUsers: User[] = [
  { id: 'USER001', name: 'Admin Geral', email: 'Admin@Uai.com', avatar: '/avatars/01.png', role: 'Administrador' },
  { id: 'USER002', name: 'Eduardo Gerente', email: 'eduardo@lacort.com', avatar: '/avatars/02.png', role: 'Gerente' },
  { id: 'USER003', name: 'Poliana Vendas', email: 'poliana@lacort.com', avatar: '/avatars/03.png', role: 'Vendedor' },
  { id: 'USER004', name: 'Magda Corte', email: 'magda@lacort.com', avatar: '/avatars/04.png', role: 'Cortadeira' },
  { id: 'USER005', name: 'Luciano Vendas', email: 'luciano@lacort.com', avatar: '/avatars/05.png', role: 'Vendedor' },
];

export const mockQuotes: Quote[] = [
    { id: 'QT001', customerId: 'CUST001', customerName: 'Stark Industries', creationDate: '2025-05-01', expirationDate: '2025-05-31', productType: 'Camiseta', color: 'Preto', printType: 'Silk' },
    { id: 'QT002', customerId: 'CUST002', customerName: 'Wayne Enterprises', creationDate: '2025-05-10', expirationDate: '2025-06-10', productType: 'Moletom', color: 'Cinza Mescla', printType: 'Bordado' },
];

const allMockOrders: Order[] = [
  // Pedido Completo para Testes
  {
    id: 'ORD000',
    customerId: 'CUST004',
    customerName: 'Empresa A',
    customerResponsible: 'Responsável A',
    model: 'Polo',
    color: ['Azul Royal'],
    type: ['Bordado'],
    productionType: 'Outros',
    orderDate: subDays(today, 5).toISOString(),
    deliveryDate: '2025-08-15',
    value: 4875.00,
    amountPaid: 2500,
    entryDate: subDays(today, 5).toISOString(),
    paymentCondition: ['50%'],
    quantity: 155,
    stage: 'Separação',
    stageHistory: [{ stage: 'Corte', startDate: subDays(today, 5).toISOString() }, {stage: 'Separação', startDate: subDays(today, 1).toISOString()}],
    responsible: 'Poliana',
    artSeparation: 'Pronta',
    notifications: true,
    imageUrls: ['https://placehold.co/800x400.png', 'https://placehold.co/800x400.png', 'https://placehold.co/800x400.png'],
    cutter: 'Magda',
    seamstress: 'Flavia',
    isPriority: true,
    material: ['Piquet'],
    sleeveType: 'Curta',
    collarType: 'Polo',
    additional: ['Bolso'],
    notes: 'Este é um campo de observações para testar o layout de impressão. O texto deve ser longo o suficiente para quebrar a linha e verificar se o alinhamento se mantém correto em diferentes resoluções e, principalmente, no modo de impressão. Testando 1, 2, 3.',
    sizes: {
      'PP': 5, 'P': 10, 'M': 15, 'G': 10, 'GG': 5, 'EG': 5, 'EGG': 5,
      'BIG P': 2, 'BIG M': 2, 'BIG G': 2, 'Amostra': 1, 'Sob Medida': 1,
      'PP baby': 5, 'P baby': 5, 'M baby': 10, 'G baby': 10, 'GG baby': 5, 'EG baby': 2, 'EGG baby': 2,
      'BIG P baby': 1, 'BIG M baby': 1, 'BIG G baby': 1, 'Amostra baby': 1, 'Sob Medida baby': 1,
      'Tam 2': 5, 'Tam 4': 5, 'Tam 6': 5, 'Tam 8': 5, 'Tam 10': 5, 'Tam 12': 5, 'Tam 14': 5
    }
  },
  // Pedidos para teste de cores e prioridade
  { id: 'ORD001', customerId: 'CUST001', customerName: 'Stark Industries', customerResponsible: 'Tony Stark', model: 'Tradicional', color: ['Branco'], type: ['Silk'], productionType: 'Outros', orderDate: subDays(today, 10).toISOString(), deliveryDate: '2025-06-15', value: 2500.00, amountPaid: 2500, paymentCondition: ['Total'], quantity: 50, stage: 'Separação', stageHistory: [{stage: 'Corte', startDate: subDays(today, 10).toISOString()}, {stage: 'Separação', startDate: subDays(today, 1).toISOString()}], responsible: 'Poliana', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png', 'https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Fabrica', isPriority: false, sizes: { 'P': 10, 'M': 20, 'G': 20 } },
  { id: 'ORD002', customerId: 'CUST002', customerName: 'Wayne Enterprises', customerResponsible: 'Bruce Wayne', model: 'Polo', color: ['Azul Marinho'], type: ['Bordado'], productionType: 'Bordados', orderDate: subDays(today, 16).toISOString(), deliveryDate: '2025-06-25', value: 5000.00, amountPaid: 2500, paymentCondition: ['50%'], quantity: 100, stage: 'Costura', stageHistory: [{stage: 'Corte', startDate: subDays(today, 16).toISOString()}, {stage: 'Costura', startDate: subDays(today, 5).toISOString()}], responsible: 'Eduardo', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Elisangela', isPriority: false, sizes: { 'M': 50, 'G': 50 } },
  
  // Pedidos Finalizados com diferentes condições de pagamento
  { id: 'ORD003', customerId: 'CUST003', customerName: 'Daily Planet', customerResponsible: 'Lois Lane', model: 'Moletom', color: ['Vermelho'], type: ['Sublimação Camisa Total'], productionType: 'Sublimações', orderDate: subDays(today, 32).toISOString(), deliveryDate: '2025-06-30', value: 3200.00, amountPaid: 1600.00, paymentCondition: ['50%'], quantity: 40, stage: 'Finalizado', stageHistory: [{stage: 'Corte', startDate: subDays(today, 32).toISOString()}, {stage: 'Finalizado', startDate: subDays(today, 2).toISOString()}], responsible: 'Larilson', artSeparation: 'À Separar', notifications: false, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Ilma Maria', seamstress: 'Flavia', isPriority: false, sizes: { 'P baby': 10, 'M baby': 20, 'G baby': 10 } },
  { id: 'ORD026', customerId: 'CUST004', customerName: 'Empresa A', customerResponsible: 'Responsável A', model: 'Polo', color: ['Preto'], type: ['Bordado'], productionType: 'Bordados', orderDate: subDays(today, 28).toISOString(), deliveryDate: '2025-07-02', value: 4000.00, amountPaid: 0, paymentCondition: ['Sem Entrada'], quantity: 80, stage: 'Finalizado', stageHistory: [{stage: 'Corte', startDate: subDays(today, 28).toISOString()}, {stage: 'Finalizado', startDate: subDays(today, 3).toISOString()}], responsible: 'Poliana', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Silvia', isPriority: false, sizes: { 'M': 40, 'G': 40 } },
  { id: 'ORD027', customerId: 'CUST005', customerName: 'Empresa B', customerResponsible: 'Responsável B', model: 'Tradicional', color: ['Branco'], type: ['Silk'], productionType: 'Outros', orderDate: subDays(today, 35).toISOString(), deliveryDate: '2025-07-01', value: 2500.00, amountPaid: 0, paymentCondition: ['Nota'], quantity: 100, stage: 'Finalizado', stageHistory: [{stage: 'Corte', startDate: subDays(today, 35).toISOString()}, {stage: 'Finalizado', startDate: subDays(today, 4).toISOString()}], responsible: 'Luciano', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Fabrica', isPriority: false, sizes: { 'P': 25, 'M': 50, 'G': 25 } },
  
  { id: 'ORD004', customerId: 'CUST001', customerName: 'Stark Industries', customerResponsible: 'Pepper Potts', model: 'Regata', color: ['Cinza'], type: ['Silk'], productionType: 'Outros', orderDate: subDays(today, 46).toISOString(), deliveryDate: '2025-07-05', value: 1500.00, amountPaid: 1500.00, paymentCondition: ['Total'], quantity: 75, stage: 'Estampagem', stageHistory: [{stage: 'Corte', startDate: subDays(today, 46).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 10).toISOString()}], responsible: 'Gabriel', artSeparation: 'Parcial', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Ana', isPriority: false, sizes: { 'Tam 10': 25, 'Tam 12': 25, 'Tam 14': 25 } },
  { id: 'ORD005', customerId: 'CUST002', customerName: 'Wayne Enterprises', customerResponsible: 'Bruce Wayne', model: 'Tradicional', color: ['Preto'], type: ['Silk'], productionType: 'Outros', orderDate: '2025-05-28T10:00:00.000Z', deliveryDate: '2025-07-10T17:00:00.000Z', value: 2800.00, amountPaid: 1400, paymentCondition: ['50%'], stage: 'Entregue', stageHistory: [{stage: 'Corte', startDate: '2025-05-28T10:00:00.000Z'},{stage: 'Estampagem', startDate: '2025-06-10T11:00:00.000Z'}, {stage: 'Separação', startDate: '2025-06-20T14:00:00.000Z'}, {stage: 'Costura', startDate: '2025-06-30T09:00:00.000Z'}, {stage: 'Arremate', startDate: '2025-07-08T16:00:00.000Z'}, {stage: 'Finalizado', startDate: '2025-07-10T10:00:00.000Z'}, {stage: 'Entregue', startDate: '2025-07-10T17:00:00.000Z'}], responsible: 'Luciano', artSeparation: 'Pronta', notifications: false, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Dona Cida', isPriority: false, sizes: { 'M': 30, 'G': 30 }, quantity: 60, },
  
  // Pedidos adicionais
  { id: 'ORD006', customerId: 'CUST003', customerName: 'Daily Planet', customerResponsible: 'Lois Lane', model: 'Jaqueta', color: ['Azul Royal'], type: ['Bordado'], productionType: 'Bordados', orderDate: subDays(today, 2).toISOString(), deliveryDate: '2025-07-15', value: 7800.00, amountPaid: 7800.00, paymentCondition: ['Total'], quantity: 30, stage: 'Arremate', stageHistory: [{stage: 'Corte', startDate: '2025-06-01'}, {stage: 'Arremate', startDate: '2025-07-10'}], responsible: 'Vendedor', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Ilma Maria', seamstress: 'Neyrevone', isPriority: false, sizes: { 'P': 10, 'M': 10, 'G': 10 } },
  { id: 'ORD007', customerId: 'CUST004', customerName: 'Empresa A', customerResponsible: 'Responsável A', model: 'Social', color: ['Branca'], type: ['Bordado'], productionType: 'Eventos/Prioridade', orderDate: subDays(today, 3).toISOString(), deliveryDate: '2025-07-16', value: 4500.00, amountPaid: 4000.00, paymentCondition: ['50%'], quantity: 25, stage: 'Corte', stageHistory: [{stage: 'Corte', startDate: '2025-06-02'}], responsible: 'Eduardo', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Cortador Terceirizado', seamstress: 'Rosangela', isPriority: true, sizes: { 'M': 15, 'G': 10 } },
  { id: 'ORD008', customerId: 'CUST005', customerName: 'Empresa B', customerResponsible: 'Responsável B', model: 'Boné', color: ['Preto'], type: ['Silk'], productionType: 'Outros', orderDate: subDays(today, 4).toISOString(), deliveryDate: '2025-07-17', value: 1200.00, amountPaid: 1200.00, paymentCondition: ['Total'], quantity: 100, stage: 'Correção', stageHistory: [{stage: 'Corte', startDate: '2025-06-03'}, {stage: 'Correção', startDate: '2025-07-15', reason: 'A estampa do boné saiu com a cor errada. O tom de vermelho está muito claro, precisa ser mais escuro, conforme o layout original.'}], responsible: 'Poliana', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Terceiros', isPriority: false },
  // Pedido cancelado e reintegrado para teste
  { 
    id: 'ORD009', 
    customerId: 'CUST006', 
    customerName: 'Empresa C', 
    customerResponsible: 'Responsável C', 
    model: 'Bolsa de Lona', 
    color: ['Cru'], 
    type: ['Sublimação Parcial A3'], 
    productionType: 'Sublimações', 
    orderDate: subDays(today, 10).toISOString(), 
    deliveryDate: '2025-07-18', 
    value: 800.00, 
    amountPaid: 0, 
    paymentCondition: ['Sem Entrada'], 
    quantity: 200, 
    stage: 'Cancelado', // Pedido cancelado
    stageHistory: [
      {stage: 'Corte', startDate: subDays(today, 10).toISOString()}, 
      {stage: 'Cancelado', startDate: subDays(today, 5).toISOString()}
    ], 
    responsible: 'Vendedor', 
    artSeparation: 'Pronta', 
    notifications: false, 
    imageUrls: ['https://placehold.co/800x400.png'], 
    cutter: 'A Laser',
    seamstress: 'Dona Preta', 
    isPriority: false 
  },
  
  // Pedidos entregues com histórico completo
  { id: 'ORD010', customerId: 'CUST001', customerName: 'Stark Industries', customerResponsible: 'Tony Stark', model: 'Boné', color: ['Preto'], type: ['Bordado'], productionType: 'Bordados', orderDate: '2025-06-05T09:00:00.000Z', deliveryDate: '2025-07-20T16:30:00.000Z', value: 1800.00, amountPaid: 1800.00, paymentCondition: ['Total'], quantity: 150, stage: 'Entregue', stageHistory: [{ stage: 'Corte', startDate: '2025-06-05T09:00:00.000Z' }, { stage: 'Estampagem', startDate: '2025-06-15T10:00:00.000Z' }, { stage: 'Separação', startDate: '2025-06-25T11:00:00.000Z' }, { stage: 'Costura', startDate: '2025-07-05T12:00:00.000Z' }, { stage: 'Arremate', startDate: '2025-07-15T13:00:00.000Z' }, { stage: 'Finalizado', startDate: '2025-07-20T14:00:00.000Z' }, { stage: 'Entregue', startDate: '2025-07-20T16:30:00.000Z' }], responsible: 'Poliana', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Ilma Maria', seamstress: 'Fabrica', isPriority: false },
  { id: 'ORD011', customerId: 'CUST004', customerName: 'Empresa A', customerResponsible: 'Responsável A', model: 'Polo', color: ['Vinho'], type: ['Bordado'], productionType: 'Bordados', orderDate: '2025-06-10T09:30:00.000Z', deliveryDate: '2025-07-25T18:00:00.000Z', value: 3500.00, amountPaid: 3500.00, paymentCondition: ['Total'], quantity: 70, stage: 'Entregue', stageHistory: [{ stage: 'Corte', startDate: '2025-06-10T09:30:00.000Z' }, { stage: 'Estampagem', startDate: '2025-06-20T10:30:00.000Z' }, { stage: 'Separação', startDate: '2025-06-30T11:30:00.000Z' }, { stage: 'Costura', startDate: '2025-07-10T12:30:00.000Z' }, { stage: 'Arremate', startDate: '2025-07-20T13:30:00.000Z' }, { stage: 'Finalizado', startDate: '2025-07-25T14:30:00.000Z' }, { stage: 'Entregue', startDate: '2025-07-25T18:00:00.000Z' }], responsible: 'Eduardo', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Cortador Terceirizado', seamstress: 'Silvia', isPriority: false, sizes: { 'M': 35, 'G': 35 } },
  { id: 'ORD012', customerId: 'CUST005', customerName: 'Empresa B', customerResponsible: 'Responsável B', model: 'Tradicional', color: ['Branco'], type: ['Silk'], productionType: 'Outros', orderDate: '2025-05-15T14:00:00.000Z', deliveryDate: '2025-06-18T15:00:00.000Z', value: 2200.00, amountPaid: 1000.00, paymentCondition: ['50%'], quantity: 110, stage: 'Entregue', stageHistory: [{ stage: 'Corte', startDate: '2025-05-15T14:00:00.000Z' }, { stage: 'Estampagem', startDate: '2025-05-25T15:00:00.000Z' }, { stage: 'Separação', startDate: '2025-06-02T16:00:00.000Z' }, { stage: 'Costura', startDate: '2025-06-10T17:00:00.000Z' }, { stage: 'Arremate', startDate: '2025-06-15T18:00:00.000Z' }, { stage: 'Finalizado', startDate: '2025-06-18T10:00:00.000Z' }, { stage: 'Entregue', startDate: '2025-06-18T15:00:00.000Z' }], responsible: 'Luciano', artSeparation: 'Pronta', notifications: false, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Elisangela', isPriority: false, sizes: { 'P': 50, 'M': 60 } },
  { id: 'ORD013', customerId: 'CUST006', customerName: 'Empresa C', customerResponsible: 'Responsável C', model: 'Moletom', color: ['Cinza'], type: ['Sublimação Total Frente'], productionType: 'Sublimações', orderDate: '2025-05-20T11:00:00.000Z', deliveryDate: '2025-06-28T12:00:00.000Z', value: 4100.00, amountPaid: 4100.00, paymentCondition: ['Total'], quantity: 50, stage: 'Entregue', stageHistory: [{ stage: 'Corte', startDate: '2025-05-20T11:00:00.000Z' }, { stage: 'Estampagem', startDate: '2025-05-30T12:00:00.000Z' }, { stage: 'Separação', startDate: '2025-06-08T13:00:00.000Z' }, { stage: 'Costura', startDate: '2025-06-18T14:00:00.000Z' }, { stage: 'Arremate', startDate: '2025-06-25T15:00:00.000Z' }, { stage: 'Finalizado', startDate: '2025-06-28T10:00:00.000Z' }, { stage: 'Entregue', startDate: '2025-06-28T12:00:00.000Z' }], responsible: 'Gabriel', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Flavia', isPriority: false, sizes: { 'M': 25, 'G': 25 } },
  { id: 'ORD014', customerId: 'CUST002', customerName: 'Wayne Enterprises', customerResponsible: 'Bruce Wayne', model: 'Jaqueta', color: ['Preto'], type: ['Bordado'], productionType: 'Bordados', orderDate: '2025-04-10T16:00:00.000Z', deliveryDate: '2025-05-15T17:00:00.000Z', value: 9500.00, amountPaid: 9500.00, paymentCondition: ['Total'], quantity: 50, stage: 'Entregue', stageHistory: [{ stage: 'Corte', startDate: '2025-04-10T16:00:00.000Z' }, { stage: 'Estampagem', startDate: '2025-04-20T17:00:00.000Z' }, { stage: 'Separação', startDate: '2025-04-30T18:00:00.000Z' }, { stage: 'Costura', startDate: '2025-05-08T19:00:00.000Z' }, { stage: 'Arremate', startDate: '2025-05-12T20:00:00.000Z' }, { stage: 'Finalizado', startDate: '2025-05-15T10:00:00.000Z' }, { stage: 'Entregue', startDate: '2025-05-15T17:00:00.000Z' }], responsible: 'Eduardo', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Ilma Maria', seamstress: 'Silvia', isPriority: false, sizes: { 'P': 10, 'M': 20, 'G': 15, 'GG': 5 } },

  // Pedidos movidos para Estampagem para teste
  { id: 'ORD015', customerId: 'CUST004', customerName: 'Empresa A', customerResponsible: 'Responsável A', model: 'Tradicional', color: ['Verde'], type: ['Bordado'], productionType: 'Bordados', orderDate: subDays(today, 1).toISOString(), deliveryDate: '2025-08-01', value: 1000.00, amountPaid: 500.00, paymentCondition: ['50%'], quantity: 20, stage: 'Estampagem', stageHistory: [{stage: 'Corte', startDate: subDays(today, 2).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 1).toISOString()}], responsible: 'Poliana', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Fabrica', isPriority: false, sizes: { 'G': 20 } },
  { id: 'ORD016', customerId: 'CUST005', customerName: 'Empresa B', customerResponsible: 'Responsável B', model: 'Regata', color: ['Amarelo'], type: ['Sublimação Camisa Total'], productionType: 'Sublimações', orderDate: subDays(today, 2).toISOString(), deliveryDate: '2025-08-02', value: 1500.00, amountPaid: 1500.00, paymentCondition: ['Total'], quantity: 30, stage: 'Estampagem', stageHistory: [{stage: 'Corte', startDate: subDays(today, 2).toISOString()}, { stage: 'Estampagem', startDate: subDays(today, 1).toISOString() }], responsible: 'Luciano', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Elisangela', isPriority: false, sizes: { 'M baby': 15, 'G baby': 15 } },
  { id: 'ORD017', customerId: 'CUST006', customerName: 'Empresa C', customerResponsible: 'Responsável C', model: 'Polo', color: ['Laranja'], type: ['Lisa'], productionType: 'Outros', orderDate: subDays(today, 3).toISOString(), deliveryDate: '2025-08-03', value: 2000.00, amountPaid: 1000.00, paymentCondition: ['50%'], quantity: 40, stage: 'Corte', stageHistory: [{stage: 'Corte', startDate: subDays(today, 3).toISOString()}], responsible: 'Gabriel', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Ilma Maria', seamstress: 'Flavia', isPriority: false, sizes: { 'P': 10, 'M': 10, 'G': 10, 'GG': 10 } },
  { id: 'ORD018', customerId: 'CUST001', customerName: 'Stark Industries', customerResponsible: 'Tony Stark', model: 'Tradicional', color: ['Preto'], type: ['Bordado'], productionType: 'Eventos/Prioridade', orderDate: subDays(today, 1).toISOString(), deliveryDate: '2025-07-28', value: 500.00, amountPaid: 500.00, paymentCondition: ['Total'], quantity: 10, stage: 'Estampagem', stageHistory: [{stage: 'Corte', startDate: subDays(today, 2).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 1).toISOString()}], responsible: 'Eduardo', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Cortador Terceirizado', seamstress: 'Silvia', isPriority: true, sizes: { 'M': 10 } },
  { id: 'ORD019', customerId: 'CUST002', customerName: 'Wayne Enterprises', customerResponsible: 'Bruce Wayne', model: 'Moletom', color: ['Cinza'], type: ['Sublimação Total Costas'], productionType: 'Sublimações', orderDate: subDays(today, 4).toISOString(), deliveryDate: '2025-08-04', value: 2500.00, amountPaid: 1250.00, paymentCondition: ['50%'], quantity: 50, stage: 'Corte', stageHistory: [{stage: 'Corte', startDate: subDays(today, 4).toISOString()}], responsible: 'Poliana', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Magda', isPriority: false, sizes: { 'M': 25, 'G': 25 } },
  { id: 'ORD020', customerId: 'CUST004', customerName: 'Empresa A', customerResponsible: 'Responsável A', model: 'Tradicional', color: ['Azul'], type: ['Silk Digital (DTF)'], productionType: 'Outros', orderDate: subDays(today, 2).toISOString(), deliveryDate: '2025-08-05', value: 1200.00, amountPaid: 1200.00, paymentCondition: ['Total'], quantity: 25, stage: 'Estampagem', stageHistory: [{stage: 'Corte', startDate: subDays(today, 3).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 2).toISOString()}], responsible: 'Luciano', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Neyrevone', isPriority: false, sizes: { 'P': 10, 'M': 10, 'G': 5 } },
  { id: 'ORD021', customerId: 'CUST005', customerName: 'Empresa B', customerResponsible: 'Responsável B', model: 'Polo', color: ['Branco'], type: ['Policromia'], productionType: 'Outros', orderDate: subDays(today, 5).toISOString(), deliveryDate: '2025-08-10', value: 3000.00, amountPaid: 1500.00, paymentCondition: ['50%'], quantity: 60, stage: 'Estampagem', stageHistory: [{stage: 'Corte', startDate: subDays(today, 5).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 1).toISOString()}], responsible: 'Gabriel', artSeparation: 'À Separar', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Rosangela', isPriority: false, sizes: { 'P': 15, 'M': 30, 'G': 15 } },

  // Novos pedidos para teste da página de Separação
  { id: 'ORD022', customerId: 'CUST001', customerName: 'Stark Industries', customerResponsible: 'Pepper Potts', model: 'Moletom', color: ['Preto'], type: ['Lisa'], productionType: 'Outros', orderDate: subDays(today, 2).toISOString(), deliveryDate: '2025-08-12', value: 2800.00, amountPaid: 2800.00, paymentCondition: ['Total'], quantity: 40, stage: 'Separação', stageHistory: [{stage: 'Corte', startDate: subDays(today, 3).toISOString()}, {stage: 'Separação', startDate: subDays(today, 1).toISOString()}], responsible: 'Gabriel', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Ilma Maria', seamstress: 'Ana', isPriority: false, sizes: { 'M': 20, 'G': 20 } },
  { id: 'ORD023', customerId: 'CUST002', customerName: 'Wayne Enterprises', customerResponsible: 'Bruce Wayne', model: 'Jaqueta', color: ['Verde Musgo'], type: ['Bordado'], productionType: 'Bordados', orderDate: subDays(today, 4).toISOString(), deliveryDate: '2025-08-14', value: 5500.00, amountPaid: 5500.00, paymentCondition: ['Total'], quantity: 25, stage: 'Separação', stageHistory: [{stage: 'Corte', startDate: subDays(today, 5).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 3).toISOString()}, {stage: 'Separação', startDate: subDays(today, 2).toISOString()}], responsible: 'Eduardo', artSeparation: 'Pronta', notifications: false, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'A Laser', seamstress: 'Dona Cida', isPriority: false, sizes: { 'G': 15, 'GG': 10 } },
  { id: 'ORD024', customerId: 'CUST003', customerName: 'Daily Planet', customerResponsible: 'Lois Lane', model: 'Social', color: ['Branco'], type: ['Lisa'], productionType: 'Eventos/Prioridade', orderDate: subDays(today, 1).toISOString(), deliveryDate: '2025-07-30', value: 1800.00, amountPaid: 900.00, paymentCondition: ['50%'], quantity: 15, stage: 'Separação', stageHistory: [{stage: 'Corte', startDate: subDays(today, 2).toISOString()}, {stage: 'Separação', startDate: subDays(today, 1).toISOString()}], responsible: 'Poliana', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Magda', seamstress: 'Dona Preta', isPriority: true, sizes: { 'P': 5, 'M': 5, 'G': 5 } },
  { id: 'ORD025', customerId: 'CUST004', customerName: 'Empresa A', customerResponsible: 'Responsável A', model: 'Regata', color: ['Amarelo Ouro'], type: ['Silk'], productionType: 'Outros', orderDate: subDays(today, 6).toISOString(), deliveryDate: '2025-08-20', value: 950.00, amountPaid: 950.00, paymentCondition: ['Total'], quantity: 50, stage: 'Separação', stageHistory: [{stage: 'Corte', startDate: subDays(today, 7).toISOString()}, {stage: 'Estampagem', startDate: subDays(today, 4).toISOString()}, {stage: 'Separação', startDate: subDays(today, 1).toISOString()}], responsible: 'Vendedor', artSeparation: 'Pronta', notifications: true, imageUrls: ['https://placehold.co/800x400.png'], cutter: 'Cortador Terceirizado', seamstress: 'Terceiros', isPriority: false, sizes: { 'P': 25, 'M': 25 } },

  // Pedidos de Reposição para teste
  {
    id: 'ORD028',
    customerId: 'CUST001',
    customerName: 'Stark Industries',
    customerResponsible: 'Tony Stark',
    model: 'Tradicional',
    color: ['Branco'],
    type: ['Silk'],
    productionType: 'Outros',
    orderDate: subDays(today, 8).toISOString(),
    deliveryDate: '2025-08-25',
    value: 1500.00,
    quantity: 30,
    stage: 'Reposição de Corte',
    stageHistory: [
      { stage: 'Corte', startDate: subDays(today, 8).toISOString() },
      { stage: 'Estampagem', startDate: subDays(today, 4).toISOString() },
      { stage: 'Reposição de Corte', startDate: subDays(today, 1).toISOString(), reason: '1 peça M manchou na estampa da frente.' }
    ],
    responsible: 'Poliana',
    artSeparation: 'Pronta',
    notifications: true,
    imageUrls: ['https://placehold.co/800x400.png'],
    cutter: 'Magda',
    seamstress: 'Fabrica',
    isPriority: false,
    sizes: { 'M': 30 },
    lossRecords: [
        { date: subDays(today, 1).toISOString(), description: '1 peça M manchou na estampa da frente.', stage: 'Estampagem' }
    ]
  },
  {
    id: 'ORD029',
    customerId: 'CUST002',
    customerName: 'Wayne Enterprises',
    customerResponsible: 'Bruce Wayne',
    model: 'Polo',
    color: ['Preto'],
    type: ['Bordado'],
    productionType: 'Bordados',
    orderDate: subDays(today, 7).toISOString(),
    deliveryDate: '2025-08-28',
    value: 2000.00,
    quantity: 40,
    stage: 'Reposição de Corte',
    stageHistory: [
      { stage: 'Corte', startDate: subDays(today, 7).toISOString() },
      { stage: 'Estampagem', startDate: subDays(today, 3).toISOString() },
      { stage: 'Reposição de Corte', startDate: subDays(today, 2).toISOString(), reason: 'Bordado da gola saiu torto em 2 peças G.' }
    ],
    responsible: 'Eduardo',
    artSeparation: 'Pronta',
    notifications: true,
    imageUrls: ['https://placehold.co/800x400.png'],
    cutter: 'A Laser',
    seamstress: 'Elisangela',
    isPriority: true,
    sizes: { 'G': 40 },
    lossRecords: [
      { date: subDays(today, 2).toISOString(), description: 'Bordado da gola saiu torto em 2 peças G.', stage: 'Estampagem' }
    ]
  },
  {
    id: 'ORD030', // Pedido para ser deletado
    customerId: 'CUST003',
    customerName: 'Daily Planet',
    customerResponsible: 'Lois Lane',
    model: 'Avental Pescoço',
    color: ['Branco'],
    type: ['Silk'],
    productionType: 'Outros',
    orderDate: subDays(today, 12).toISOString(),
    deliveryDate: '2025-09-01',
    value: 500.00,
    quantity: 20,
    stage: 'Deletado',
    stageHistory: [
      { stage: 'Corte', startDate: subDays(today, 12).toISOString() },
      { stage: 'Estampagem', startDate: subDays(today, 8).toISOString() },
      { stage: 'Deletado', startDate: subDays(today, 1).toISOString() },
    ],
    responsible: 'Gabriel',
    artSeparation: 'Pronta',
    notifications: false,
    imageUrls: ['https://placehold.co/800x400.png'],
    cutter: 'Ilma Maria',
    seamstress: 'Flavia',
    isPriority: false,
  },
  // Pedidos para teste do relatório de costura
  {
    id: 'ORD031',
    customerId: 'CUST001',
    customerName: 'Stark Industries',
    customerResponsible: 'Tony Stark',
    model: 'Tradicional',
    color: ['Preto'],
    type: ['Silk'],
    productionType: 'Outros',
    orderDate: '2025-05-10T10:00:00.000Z',
    deliveryDate: '2025-06-15T10:00:00.000Z',
    value: 1250.00,
    quantity: 50,
    stage: 'Entregue',
    stageHistory: [
      { stage: 'Corte', startDate: '2025-05-10T10:00:00.000Z' },
      { stage: 'Costura', startDate: '2025-06-01T10:00:00.000Z' },
      { stage: 'Arremate', startDate: '2025-06-10T10:00:00.000Z' },
      { stage: 'Entregue', startDate: '2025-06-15T10:00:00.000Z' },
    ],
    responsible: 'Poliana',
    artSeparation: 'Pronta',
    notifications: true,
    cutter: 'Magda',
    seamstress: 'Elisangela',
    isPriority: false,
  },
  {
    id: 'ORD032',
    customerId: 'CUST001',
    customerName: 'Stark Industries',
    customerResponsible: 'Tony Stark',
    model: 'Polo',
    color: ['Branco'],
    type: ['Bordado'],
    productionType: 'Bordados',
    orderDate: '2025-05-12T10:00:00.000Z',
    deliveryDate: '2025-06-20T10:00:00.000Z',
    value: 2000.00,
    quantity: 40,
    stage: 'Entregue',
    stageHistory: [
      { stage: 'Corte', startDate: '2025-05-12T10:00:00.000Z' },
      { stage: 'Costura', startDate: '2025-06-05T10:00:00.000Z' },
      { stage: 'Arremate', startDate: '2025-06-15T10:00:00.000Z' },
      { stage: 'Entregue', startDate: '2025-06-20T10:00:00.000Z' },
    ],
    responsible: 'Eduardo',
    artSeparation: 'Pronta',
    notifications: true,
    cutter: 'A Laser',
    seamstress: 'Elisangela',
    isPriority: false,
  },
  {
    id: 'ORD033',
    customerId: 'CUST002',
    customerName: 'Wayne Enterprises',
    customerResponsible: 'Bruce Wayne',
    model: 'Moletom',
    color: ['Cinza Mescla'],
    type: ['Sublimação Total Frente'],
    productionType: 'Sublimações',
    orderDate: '2025-05-18T10:00:00.000Z',
    deliveryDate: '2025-06-25T10:00:00.000Z',
    value: 3500.00,
    quantity: 70,
    stage: 'Entregue',
    stageHistory: [
      { stage: 'Corte', startDate: '2025-05-18T10:00:00.000Z' },
      { stage: 'Costura', startDate: '2025-06-12T10:00:00.000Z' },
      { stage: 'Arremate', startDate: '2025-06-20T10:00:00.000Z' },
      { stage: 'Entregue', startDate: '2025-06-25T10:00:00.000Z' },
    ],
    responsible: 'Luciano',
    artSeparation: 'Pronta',
    notifications: true,
    cutter: 'Ilma Maria',
    seamstress: 'Flavia',
    isPriority: false,
  },
  {
    id: 'ORD034',
    customerId: 'CUST003',
    customerName: 'Daily Planet',
    customerResponsible: 'Lois Lane',
    model: 'Jaqueta',
    color: ['Azul Marinho'],
    type: ['Bordado'],
    productionType: 'Bordados',
    orderDate: '2025-05-22T10:00:00.000Z',
    deliveryDate: '2025-06-30T10:00:00.000Z',
    value: 4200.00,
    quantity: 30,
    stage: 'Entregue',
    stageHistory: [
      { stage: 'Corte', startDate: '2025-05-22T10:00:00.000Z' },
      { stage: 'Costura', startDate: '2025-06-18T10:00:00.000Z' },
      { stage: 'Arremate', startDate: '2025-06-25T10:00:00.000Z' },
      { stage: 'Entregue', startDate: '2025-06-30T10:00:00.000Z' },
    ],
    responsible: 'Gabriel',
    artSeparation: 'Pronta',
    notifications: true,
    cutter: 'Magda',
    seamstress: 'Silvia',
    isPriority: true,
  },
  {
    id: 'ORD035',
    customerId: 'CUST004',
    customerName: 'Empresa A',
    customerResponsible: 'Responsável A',
    model: 'Tradicional',
    color: ['Verde'],
    type: ['Silk'],
    productionType: 'Outros',
    orderDate: '2025-05-25T10:00:00.000Z',
    deliveryDate: '2025-06-28T10:00:00.000Z',
    value: 1800.00,
    quantity: 90,
    stage: 'Entregue',
    stageHistory: [
      { stage: 'Corte', startDate: '2025-05-25T10:00:00.000Z' },
      { stage: 'Costura', startDate: '2025-06-15T10:00:00.000Z' },
      { stage: 'Arremate', startDate: '2025-06-22T10:00:00.000Z' },
      { stage: 'Entregue', startDate: '2025-06-28T10:00:00.000Z' },
    ],
    responsible: 'Vendedor',
    artSeparation: 'Pronta',
    notifications: true,
    cutter: 'A Laser',
    seamstress: 'Flavia',
    isPriority: false,
  },
];
export const mockOrders = allMockOrders;

export const mockProductionLots: ProductionLot[] = [
    {
      id: 'LOTE001',
      name: 'Lote de Corte Semana 1',
      cutter: 'Cortador Terceirizado',
      orderIds: ['ORD007', 'ORD011'],
      totalPieces: 95,
      creationDate: subDays(today, 5).toISOString(),
      status: 'Enviado para Facção',
    },
    {
      id: 'LOTE002',
      name: 'Lote Laser - Bordados',
      cutter: 'A Laser',
      orderIds: ['ORD002', 'ORD005', 'ORD029'],
      totalPieces: 200,
      creationDate: subDays(today, 2).toISOString(),
      status: 'Pendente',
    },
    {
        id: 'LOTE003',
        name: 'Lote Magda - Uniformes',
        cutter: 'Magda',
        orderIds: ['ORD001', 'ORD008'],
        totalPieces: 150,
        creationDate: subDays(today, 1).toISOString(),
        status: 'Recebido da Facção',
    }
];

export const productionStats = {
  active: allMockOrders.filter(o => !['Finalizado', 'Entregue', 'Cancelado', 'Deletado'].includes(o.stage)).length,
  cutting: allMockOrders.filter(o => o.stage === 'Corte').length,
  reposition: allMockOrders.filter(o => o.stage === 'Reposição de Corte').length,
  printing: allMockOrders.filter(o => o.stage === 'Estampagem').length,
  separation: allMockOrders.filter(o => o.stage === 'Separação').length,
  sewing: allMockOrders.filter(o => o.stage === 'Costura').length,
  finishing: allMockOrders.filter(o => o.stage === 'Arremate').length,
  correction: allMockOrders.filter(o => o.stage === 'Correção').length,
  finished: allMockOrders.filter(o => o.stage === 'Finalizado').length,
  delivered: allMockOrders.filter(o => o.stage === 'Entregue').length,
};

// DYNAMIC DATA FOR CHARTS

// Production by Responsible Chart
const activeOrders = allMockOrders.filter(o => !['Entregue', 'Cancelado', 'Deletado'].includes(o.stage));
const ordersByResponsible = activeOrders.reduce((acc, order) => {
  acc[order.responsible] = (acc[order.responsible] || 0) + 1;
  return acc;
}, {} as Record<Responsible, number>);

const responsibleColors: Record<Responsible, string> = {
  'Eduardo': 'hsl(var(--chart-1))',
  'Luciano': 'hsl(var(--chart-2))',
  'Poliana': 'hsl(var(--chart-3))',
  'Gabriel': 'hsl(var(--chart-4))',
  'Larilson': 'hsl(var(--chart-5))',
  'Vendedor': 'hsl(var(--muted-foreground))',
  'Terceiros': 'hsl(var(--accent-foreground))',
};

const shortResponsibleNames: Record<Responsible, string> = {
  'Eduardo': 'Edu',
  'Luciano': 'Lu',
  'Poliana': 'Poli',
  'Gabriel': 'Gabi',
  'Larilson': 'Lari',
  'Vendedor': 'Vend',
  'Terceiros': 'Terc',
};

export const monthlyProductionData = internalResponsibles.map(responsible => ({
  name: shortResponsibleNames[responsible] || responsible,
  Pedidos: ordersByResponsible[responsible] || 0,
  fill: responsibleColors[responsible],
}));


// Production Stage Distribution Chart
const stageCounts = allMockOrders.reduce((acc, order) => {
    // We only want to count orders that are in a production stage or finished, not delivered/canceled
    if (!['Entregue', 'Cancelado', 'Deletado'].includes(order.stage)) {
        const stageName = order.stage;
        acc[stageName] = (acc[stageName] || 0) + 1;
    }
    return acc;
}, {} as Record<string, number>);

const stageColors: Record<string, string> = {
    'Corte': '#6B7280', // bg-gray-500
    'Reposição de Corte': '#F59E0B', // bg-amber-500
    'Estampagem': '#F97316', // bg-orange-500
    'Separação': '#EAB308', // bg-yellow-500
    'Costura': '#A855F7', // bg-purple-500
    'Arremate': '#A1A1AA', // bg-gray-400
    'Correção': '#EF4444', // bg-red-500
    'Finalizado': '#14B8A6', // bg-teal-500
};

const stageOrder: OrderStage[] = ['Corte', 'Reposição de Corte', 'Estampagem', 'Separação', 'Costura', 'Arremate', 'Correção', 'Finalizado'];

export const productionTypeData = stageOrder
  .filter(stage => stageCounts[stage] > 0) // Only include stages that have orders
  .map(stage => ({
    name: stage,
    value: stageCounts[stage],
    fill: stageColors[stage] || '#CCCCCC', // Fallback color
}));


// Cutting Performance Chart
const ordersByCutter = allMockOrders.reduce((acc, order) => {
  if (order.cutter) {
    acc[order.cutter] = (acc[order.cutter] || 0) + 1;
  }
  return acc;
}, {} as Record<string, number>);

const cutterColors: Record<string, string> = {
    'Magda': 'hsl(var(--chart-1))',
    'Cortador Terceirizado': 'hsl(var(--chart-2))',
    'A Laser': 'hsl(var(--chart-3))',
    'Ilma Maria': 'hsl(var(--chart-4))',
};

export const cuttingChartData = cutters.map(cutter => ({
    name: cutter,
    value: ordersByCutter[cutter] || 0,
    fill: cutterColors[cutter] || 'hsl(var(--muted))',
}));

// Recent Orders Table
export const recentOrdersData = allMockOrders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return isWithinInterval(orderDate, { start: subDays(today, 7), end: today });
});

export const mockUserActions: UserAction[] = [
  {
    id: 'ACT001',
    type: 'Login',
    timestamp: subMinutes(today, 5).toISOString(),
    description: 'Login bem-sucedido no sistema.',
  },
  {
    id: 'ACT002',
    type: 'Etapa Alterada',
    timestamp: subHours(today, 1).toISOString(),
    description: 'Avançou o pedido de "Corte" para "Estampagem".',
    details: {
      orderId: 'ORD015',
      customer: 'Empresa A',
      from: 'Corte',
      to: 'Estampagem',
    },
  },
  {
    id: 'ACT003',
    type: 'Pedido Criado',
    timestamp: subHours(today, 3).toISOString(),
    description: 'Criou um novo pedido para o cliente.',
    details: {
      orderId: 'ORD024',
      customer: 'Daily Planet',
    },
  },
  {
    id: 'ACT004',
    type: 'Checklist Marcado',
    timestamp: subHours(today, 4).toISOString(),
    description: 'Confirmou checklist de separação para o pedido.',
    details: {
      orderId: 'ORD022',
      customer: 'Stark Industries',
    },
  },
  {
    id: 'ACT005',
    type: 'Pedido Editado',
    timestamp: subDays(today, 1).toISOString(),
    description: 'Editou as quantidades na grade do pedido.',
    details: {
      orderId: 'ORD002',
      customer: 'Wayne Enterprises',
    },
  },
   {
    id: 'ACT006',
    type: 'Senha Alterada',
    timestamp: subDays(today, 2).toISOString(),
    description: 'O usuário alterou sua própria senha.',
  },
  {
    id: 'ACT007',
    type: 'Pedido Cancelado',
    timestamp: subDays(today, 2).toISOString(),
    description: 'Cancelou o pedido do cliente.',
    details: {
      orderId: 'ORD009',
      customer: 'Empresa C',
    },
  },
];


export const mockCashFlowData: DailyCashRecord[] = [
  {
    date: '2025-08-06T12:00:00Z',
    initialBalance: 160.00,
    transactions: [
      { id: 1, date: '2025-08-06T12:00:00Z', source: 'Cliente Balcão', description: 'Uniformes Escolares', paymentMethod: 'Dinheiro', value: 197.00, type: 'Entrada', receiptImageUrl: 'https://placehold.co/500x500.png' },
      { id: 2, date: '2025-08-06T12:00:00Z', source: 'Pref. Inhapim', description: 'Uniformes', paymentMethod: 'Transferencia/ Pix', value: 985.00, type: 'Entrada' },
      { id: 3, date: '2025-08-06T12:00:00Z', source: 'Vôlei dos Primos', description: 'Uniformes Esportivos', paymentMethod: 'Transferencia/ Pix', value: 390.00, type: 'Entrada' },
      { id: 4, date: '2025-08-06T12:00:00Z', source: 'E.E. Isabel Vieira', description: 'Uniformes', paymentMethod: 'Transferencia/ Pix', value: 1710.00, type: 'Entrada' },
      { id: 5, date: '2025-08-06T12:00:00Z', source: 'Caixinha', description: 'Retirada para despesas', paymentMethod: 'Dinheiro', value: 200.00, type: 'Saída' },
      { id: 6, date: '2025-08-06T12:00:00Z', source: 'Papelaria XYZ', description: 'Lixa d’água', paymentMethod: 'Dinheiro', value: 4.00, type: 'Saída' },
      { id: 7, date: '2025-08-06T12:00:00Z', source: 'Pref. Inhapim*', description: 'Uniformes*', paymentMethod: 'Transferencia/ Pix', value: 985.00, type: 'Saída' },
      { id: 8, date: '2025-08-06T12:00:00Z', source: 'Vôlei dos Primos*', description: 'Uniformes Esportivos*', paymentMethod: 'Transferencia/ Pix', value: 390.00, type: 'Saída' },
      { id: 9, date: '2025-08-06T12:00:00Z', source: 'E.E. Isabel Vieira*', description: 'Uniformes*', paymentMethod: 'Transferencia/ Pix', value: 1710.00, type: 'Saída' },
      { id: 10, date: '2025-08-06T12:00:00Z', source: 'Cliente Balcão', description: 'Venda Cartão', paymentMethod: 'Cartão', value: 367.00, type: 'Entrada' },
    ],
    balance: {
      cash: 153.00,
      coins: 0.00,
    }
  },
  {
    date: '2025-08-07T12:00:00Z',
    initialBalance: 153.00,
    transactions: [
      { id: 1, date: '2025-08-07T12:00:00Z', source: 'Fornecedor de Tecidos A', description: 'Pagamento de boleto', paymentMethod: 'Boleto', value: 1250.00, type: 'Saída' },
      { id: 2, date: '2025-08-07T12:00:00Z', source: 'Stark Industries', description: 'Adiantamento Pedido ORD001', paymentMethod: 'Dinheiro', value: 500.00, type: 'Entrada' },
      { id: 3, date: '2025-08-07T12:00:00Z', source: 'Restaurante da Esquina', description: 'Compra de almoço', paymentMethod: 'Dinheiro', value: 55.00, type: 'Saída' },
      { id: 4, date: '2025-08-07T12:00:00Z', source: 'Wayne Enterprises', description: 'Venda Uniforme Wayne Ent.', paymentMethod: 'Cartão', value: 850.00, type: 'Entrada' },
    ],
    balance: {
      cash: 598.00,
      coins: 0.00,
    }
  }
];

export const mockInventory: InventoryItem[] = [
    { id: 'INV001', category: 'Malha PV', name: 'Malha PV', color: 'Branco', quantity: 150.5, supplier: 'Fornecedor A', lastUpdated: subDays(today, 2).toISOString() },
    { id: 'INV002', category: 'Malha PV', name: 'Malha PV', color: 'Preto', quantity: 220.0, supplier: 'Fornecedor A', lastUpdated: subDays(today, 2).toISOString() },
    { id: 'INV003', category: 'Malha PV', name: 'Malha PV', color: 'Azul Royal', quantity: 80.2, supplier: 'Fornecedor B', lastUpdated: subDays(today, 5).toISOString() },
    { id: 'INV004', category: 'Malha PP', name: 'Malha PP Fio 30', color: 'Vermelho', quantity: 125.0, supplier: 'Fornecedor B', lastUpdated: subDays(today, 1).toISOString() },
    { id: 'INV005', category: 'Piquet', name: 'Piquet 24/1', color: 'Branco', quantity: 300.8, supplier: 'Fornecedor A', lastUpdated: subDays(today, 10).toISOString() },
    { id: 'INV006', category: 'Dryfit', name: 'Dryfit Colmeia', color: 'Amarelo', quantity: 75.0, supplier: 'Fornecedor C', lastUpdated: subDays(today, 3).toISOString() },
    { id: 'INV007', category: 'Moletom', name: 'Moletom 3 Cabos Felpado', color: 'Cinza Mescla', quantity: 95.5, supplier: 'Fornecedor C', lastUpdated: subDays(today, 7).toISOString() },
];
