'use client';

import { useState, useEffect, useCallback } from 'react';
import type { 
  Customer, 
  Order, 
  User, 
  Quote, 
  DailyCashRecord, 
  InventoryItem, 
  InventoryMovement,
  OrderStage,
  CashFlowTransaction
} from './types';
import { 
  mockCustomers, 
  mockOrders, 
  mockUsers, 
  mockQuotes, 
  mockCashFlowData, 
  mockInventory 
} from './mock-data';
import { calculateOrderCosts } from './cost-calculator';
import {
  orderModels,
  materials,
  shirtColors,
  sleeveColors,
  cuffColors,
  collarColors,
  stampTypes,
  collarTypes,
  sleeveTypes,
  additionalItems,
  paymentMethods,
  paymentConditions,
  cutters,
  seamstresses,
  internalResponsibles,
  orderSituations,
  productionTypes
} from '@/components/orders/order-constants';

const STORAGE_KEYS = {
  ORDERS: 'uai_orders_v1',
  CUSTOMERS: 'uai_customers_v1',
  USERS: 'uai_users_v1',
  QUOTES: 'uai_quotes_v1',
  CASH_FLOW: 'uai_cash_flow_v1',
  INVENTORY: 'uai_inventory_v1',
  SETTINGS: 'uai_settings_v1',
} as const;

const EVENT_NAME = 'uai_datastore_change';

function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Initial settings categories mapping
const defaultSettingsCategories: Record<string, string[]> = {
  models: [...orderModels],
  materials: [...materials],
  colors: [...shirtColors],
  'sleeve-colors': [...sleeveColors],
  'cuff-colors': [...cuffColors],
  'collar-colors': [...collarColors],
  stamps: [...stampTypes],
  collars: [...collarTypes],
  sleeves: [...sleeveTypes],
  additionals: [...additionalItems],
  'payment-forms': [...paymentMethods],
  'payment-conditions': [...paymentConditions],
  situations: [...orderSituations],
  'production-types': [...productionTypes],
  responsibles: [...internalResponsibles],
  cutters: [...cutters],
  seamstresses: [...seamstresses],
  cities: [...new Set(mockCustomers.map(c => c.city).filter(Boolean))] as string[],
};

// ========================
// CORE API
// ========================

export const dataStore = {
  // --- CUSTOMERS ---
  getCustomers(): Customer[] {
    return getStorageItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, mockCustomers);
  },
  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  },
  saveCustomer(customerData: Partial<Customer>): Customer {
    const list = this.getCustomers();
    if (customerData.id) {
      const index = list.findIndex(c => c.id === customerData.id);
      if (index !== -1) {
        const updated = { ...list[index], ...customerData } as Customer;
        list[index] = updated;
        setStorageItem(STORAGE_KEYS.CUSTOMERS, list);
        return updated;
      }
    }
    // Generate new ID
    const maxNumber = list.reduce((max, c) => {
      const match = c.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const newId = `CUST${String(maxNumber + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      id: newId,
      companyName: customerData.companyName || '',
      responsible: customerData.responsible || '',
      role: customerData.role || 'Responsável',
      email: customerData.email || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      cnpj: customerData.cnpj || '',
      cpf: customerData.cpf || '',
      imageUrl: customerData.imageUrl || '',
      city: customerData.city || '',
      uf: customerData.uf || '',
    };
    list.unshift(newCustomer);
    setStorageItem(STORAGE_KEYS.CUSTOMERS, list);
    return newCustomer;
  },
  deleteCustomer(id: string): void {
    const list = this.getCustomers().filter(c => c.id !== id);
    setStorageItem(STORAGE_KEYS.CUSTOMERS, list);
  },

  // --- ORDERS ---
  getOrders(): Order[] {
    const list = getStorageItem<Order[]>(STORAGE_KEYS.ORDERS, mockOrders);
    return list.map(o => {
      if (!o.costDetails) {
        o.costDetails = calculateOrderCosts({
          model: o.model,
          material: o.material,
          stampTypes: o.type,
          quantity: o.quantity,
          totalValue: o.value,
        });
      }
      return o;
    });
  },
  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id || o.id === `ORD${id}` || o.id.replace('ORD', '') === id);
  },
  saveOrder(orderData: Partial<Order>): Order {
    const list = this.getOrders();
    const existingIndex = orderData.id ? list.findIndex(o => o.id === orderData.id) : -1;

    const computedCosts = orderData.costDetails || calculateOrderCosts({
      model: orderData.model || (existingIndex !== -1 ? list[existingIndex].model : 'Tradicional'),
      material: orderData.material || (existingIndex !== -1 ? list[existingIndex].material : 'Malha PV'),
      stampTypes: orderData.type || (existingIndex !== -1 ? list[existingIndex].type : ['Silk']),
      quantity: Number(orderData.quantity !== undefined ? orderData.quantity : (existingIndex !== -1 ? list[existingIndex].quantity : 1)),
      totalValue: Number(orderData.value !== undefined ? orderData.value : (existingIndex !== -1 ? list[existingIndex].value : 0)),
    });

    if (existingIndex !== -1) {
      const existing = list[existingIndex];
      const updated: Order = {
        ...existing,
        ...orderData,
        costDetails: computedCosts,
        stageHistory: orderData.stage && orderData.stage !== existing.stage 
          ? [...(existing.stageHistory || []), { stage: orderData.stage, startDate: new Date().toISOString() }]
          : existing.stageHistory,
      } as Order;
      list[existingIndex] = updated;
      setStorageItem(STORAGE_KEYS.ORDERS, list);
      return updated;
    }

    // Generate new ID
    const maxNumber = list.reduce((max, o) => {
      const match = o.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const newId = `ORD${String(maxNumber + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: newId,
      customerId: orderData.customerId || '',
      customerName: orderData.customerName || '',
      customerResponsible: orderData.customerResponsible || '',
      model: orderData.model || 'Tradicional',
      color: orderData.color || ['Branco'],
      type: orderData.type || ['Silk'],
      productionType: orderData.productionType || 'Outros',
      orderDate: orderData.orderDate || new Date().toISOString(),
      deliveryDate: orderData.deliveryDate || new Date(Date.now() + 15 * 86400000).toISOString(),
      value: Number(orderData.value) || 0,
      quantity: Number(orderData.quantity) || 0,
      stage: orderData.stage || 'Corte',
      costDetails: computedCosts,
      stageHistory: [
        { stage: orderData.stage || 'Corte', startDate: new Date().toISOString() }
      ],
      responsible: orderData.responsible || 'Eduardo',
      artSeparation: orderData.artSeparation || 'À Separar',
      notifications: orderData.notifications ?? true,
      cutter: orderData.cutter || 'Magda',
      seamstress: orderData.seamstress || 'Fabrica',
      isPriority: orderData.isPriority ?? false,
      material: orderData.material || ['Malha PV'],
      sleeveType: orderData.sleeveType || 'Curta',
      collarType: orderData.collarType || 'Careca',
      additional: orderData.additional || [],
      sizes: orderData.sizes || {},
      notes: orderData.notes || '',
      amountPaid: orderData.amountPaid || 0,
      paymentCondition: orderData.paymentCondition || ['Total'],
      paymentMethod: orderData.paymentMethod || 'Dinheiro',
      imageUrls: orderData.imageUrls || [],
    };

    list.unshift(newOrder);
    setStorageItem(STORAGE_KEYS.ORDERS, list);
    return newOrder;
  },
  advanceOrderStage(orderId: string, newStage: OrderStage, details?: Record<string, any>): Order | null {
    const list = this.getOrders();
    const index = list.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const currentOrder = list[index];
    const updated: Order = {
      ...currentOrder,
      ...details,
      stage: newStage,
      stageHistory: [
        ...(currentOrder.stageHistory || []),
        { stage: newStage, startDate: new Date().toISOString(), ...details }
      ],
    };
    list[index] = updated;
    setStorageItem(STORAGE_KEYS.ORDERS, list);
    return updated;
  },
  cancelOrder(orderId: string, reason?: string): Order | null {
    const list = this.getOrders();
    const index = list.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const updated: Order = {
      ...list[index],
      stage: 'Cancelado',
      stageHistory: [
        ...(list[index].stageHistory || []),
        { stage: 'Cancelado', startDate: new Date().toISOString(), reason }
      ],
    };
    list[index] = updated;
    setStorageItem(STORAGE_KEYS.ORDERS, list);
    return updated;
  },
  deleteOrder(orderId: string): void {
    const list = this.getOrders();
    const index = list.findIndex(o => o.id === orderId);
    if (index === -1) return;

    // Soft delete to Deletado
    const updated: Order = {
      ...list[index],
      stage: 'Deletado',
      stageHistory: [
        ...(list[index].stageHistory || []),
        { stage: 'Deletado', startDate: new Date().toISOString() }
      ],
    };
    list[index] = updated;
    setStorageItem(STORAGE_KEYS.ORDERS, list);
  },
  restoreOrder(orderId: string, targetStage: OrderStage = 'Corte'): Order | null {
    const list = this.getOrders();
    const index = list.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const updated: Order = {
      ...list[index],
      stage: targetStage,
      stageHistory: [
        ...(list[index].stageHistory || []),
        { stage: targetStage, startDate: new Date().toISOString(), reason: 'Pedido restaurado' }
      ],
    };
    list[index] = updated;
    setStorageItem(STORAGE_KEYS.ORDERS, list);
    return updated;
  },

  // --- QUOTES ---
  getQuotes(): Quote[] {
    return getStorageItem<Quote[]>(STORAGE_KEYS.QUOTES, mockQuotes);
  },
  saveQuote(quoteData: Partial<Quote>): Quote {
    const list = this.getQuotes();
    if (quoteData.id) {
      const index = list.findIndex(q => q.id === quoteData.id);
      if (index !== -1) {
        const updated = { ...list[index], ...quoteData } as Quote;
        list[index] = updated;
        setStorageItem(STORAGE_KEYS.QUOTES, list);
        return updated;
      }
    }
    const maxNumber = list.reduce((max, q) => {
      const match = q.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const newId = `QT${String(maxNumber + 1).padStart(3, '0')}`;
    const newQuote: Quote = {
      id: newId,
      customerId: quoteData.customerId || '',
      customerName: quoteData.customerName || 'Cliente',
      creationDate: quoteData.creationDate || new Date().toISOString().split('T')[0],
      expirationDate: quoteData.expirationDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      productType: quoteData.productType || 'Camiseta',
      color: quoteData.color || 'Branco',
      printType: quoteData.printType || 'Silk',
    };
    list.unshift(newQuote);
    setStorageItem(STORAGE_KEYS.QUOTES, list);
    return newQuote;
  },
  deleteQuote(id: string): void {
    const list = this.getQuotes().filter(q => q.id !== id);
    setStorageItem(STORAGE_KEYS.QUOTES, list);
  },
  convertQuoteToOrder(quoteId: string): Order | null {
    const quote = this.getQuotes().find(q => q.id === quoteId);
    if (!quote) return null;

    const newOrder = this.saveOrder({
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerResponsible: 'Contato Orçamento',
      model: quote.productType,
      color: [quote.color],
      type: [quote.printType as any],
      value: 1500,
      quantity: 50,
      stage: 'Corte',
      notes: `Convertido do Orçamento #${quote.id}`,
    });

    this.deleteQuote(quoteId);
    return newOrder;
  },

  // --- EMPLOYEES / USERS ---
  getUsers(): User[] {
    return getStorageItem<User[]>(STORAGE_KEYS.USERS, mockUsers);
  },
  saveUser(userData: Partial<User>): User {
    const list = this.getUsers();
    if (userData.id) {
      const index = list.findIndex(u => u.id === userData.id);
      if (index !== -1) {
        const updated = { ...list[index], ...userData } as User;
        list[index] = updated;
        setStorageItem(STORAGE_KEYS.USERS, list);
        return updated;
      }
    }
    const maxNumber = list.reduce((max, u) => {
      const match = u.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const newId = `USER${String(maxNumber + 1).padStart(3, '0')}`;
    const newUser: User = {
      id: newId,
      name: userData.name || '',
      email: userData.email || '',
      avatar: userData.avatar || '/avatars/01.png',
      role: userData.role || 'Vendedor',
    };
    list.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, list);
    return newUser;
  },
  deleteUser(id: string): void {
    const list = this.getUsers().filter(u => u.id !== id);
    setStorageItem(STORAGE_KEYS.USERS, list);
  },

  // --- SETTINGS LISTS ---
  getSettingsCategories(): Record<string, string[]> {
    return getStorageItem<Record<string, string[]>>(STORAGE_KEYS.SETTINGS, defaultSettingsCategories);
  },
  getCategoryItems(categoryKey: string): string[] {
    const categories = this.getSettingsCategories();
    return categories[categoryKey] || defaultSettingsCategories[categoryKey] || [];
  },
  addCategoryItem(categoryKey: string, item: string): void {
    const trimmed = item.trim();
    if (!trimmed) return;
    const categories = this.getSettingsCategories();
    const currentList = categories[categoryKey] || defaultSettingsCategories[categoryKey] || [];
    if (!currentList.includes(trimmed)) {
      categories[categoryKey] = [...currentList, trimmed];
      setStorageItem(STORAGE_KEYS.SETTINGS, categories);
    }
  },
  updateCategoryItem(categoryKey: string, oldItem: string, newItem: string): void {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const categories = this.getSettingsCategories();
    const currentList = categories[categoryKey] || defaultSettingsCategories[categoryKey] || [];
    categories[categoryKey] = currentList.map(i => (i === oldItem ? trimmed : i));
    setStorageItem(STORAGE_KEYS.SETTINGS, categories);
  },
  deleteCategoryItem(categoryKey: string, item: string): void {
    const categories = this.getSettingsCategories();
    const currentList = categories[categoryKey] || defaultSettingsCategories[categoryKey] || [];
    categories[categoryKey] = currentList.filter(i => i !== item);
    setStorageItem(STORAGE_KEYS.SETTINGS, categories);
  },
  reorderCategoryItems(categoryKey: string, startIndex: number, endIndex: number): void {
    const categories = this.getSettingsCategories();
    const currentList = Array.from(categories[categoryKey] || defaultSettingsCategories[categoryKey] || []);
    const [removed] = currentList.splice(startIndex, 1);
    currentList.splice(endIndex, 0, removed);
    categories[categoryKey] = currentList;
    setStorageItem(STORAGE_KEYS.SETTINGS, categories);
  },

  // --- CASH FLOW ---
  getCashFlowRecords(): DailyCashRecord[] {
    return getStorageItem<DailyCashRecord[]>(STORAGE_KEYS.CASH_FLOW, mockCashFlowData);
  },
  saveCashFlowRecord(updatedRecord: DailyCashRecord): void {
    const records = this.getCashFlowRecords();
    const index = records.findIndex(r => r.date.split('T')[0] === updatedRecord.date.split('T')[0]);
    if (index !== -1) {
      records[index] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }
    setStorageItem(STORAGE_KEYS.CASH_FLOW, records);
  },

  // --- INVENTORY ---
  getInventory(): InventoryItem[] {
    return getStorageItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, mockInventory);
  },
  addInventoryMovement(itemId: string, movement: Omit<InventoryMovement, 'id' | 'itemId'>): InventoryItem | null {
    const list = this.getInventory();
    const index = list.findIndex(item => item.id === itemId);
    if (index === -1) return null;

    const item = list[index];
    const newQty = movement.type === 'Entrada' 
      ? item.quantity + movement.quantity 
      : Math.max(0, item.quantity - movement.quantity);

    const updatedItem: InventoryItem = {
      ...item,
      quantity: newQty,
      lastUpdated: new Date().toISOString(),
    };
    list[index] = updatedItem;
    setStorageItem(STORAGE_KEYS.INVENTORY, list);
    return updatedItem;
  },

  // --- BACKUP & RESTORE ---
  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      orders: this.getOrders(),
      customers: this.getCustomers(),
      users: this.getUsers(),
      quotes: this.getQuotes(),
      cashFlow: this.getCashFlowRecords(),
      inventory: this.getInventory(),
      settings: this.getSettingsCategories(),
    };
    return JSON.stringify(backup, null, 2);
  },
  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.orders) setStorageItem(STORAGE_KEYS.ORDERS, data.orders);
      if (data.customers) setStorageItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.users) setStorageItem(STORAGE_KEYS.USERS, data.users);
      if (data.quotes) setStorageItem(STORAGE_KEYS.QUOTES, data.quotes);
      if (data.cashFlow) setStorageItem(STORAGE_KEYS.CASH_FLOW, data.cashFlow);
      if (data.inventory) setStorageItem(STORAGE_KEYS.INVENTORY, data.inventory);
      if (data.settings) setStorageItem(STORAGE_KEYS.SETTINGS, data.settings);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key: 'all' } }));
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },
  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key: 'all' } }));
  }
};

// ========================
// REACT HOOKS
// ========================

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = useCallback(() => {
    setOrders(dataStore.getOrders());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    orders,
    refresh,
    saveOrder: dataStore.saveOrder.bind(dataStore),
    advanceOrderStage: dataStore.advanceOrderStage.bind(dataStore),
    cancelOrder: dataStore.cancelOrder.bind(dataStore),
    deleteOrder: dataStore.deleteOrder.bind(dataStore),
    restoreOrder: dataStore.restoreOrder.bind(dataStore),
    getOrderById: dataStore.getOrderById.bind(dataStore),
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const refresh = useCallback(() => {
    setCustomers(dataStore.getCustomers());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    customers,
    refresh,
    saveCustomer: dataStore.saveCustomer.bind(dataStore),
    deleteCustomer: dataStore.deleteCustomer.bind(dataStore),
    getCustomerById: dataStore.getCustomerById.bind(dataStore),
  };
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const refresh = useCallback(() => {
    setQuotes(dataStore.getQuotes());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    quotes,
    refresh,
    saveQuote: dataStore.saveQuote.bind(dataStore),
    deleteQuote: dataStore.deleteQuote.bind(dataStore),
    convertQuoteToOrder: dataStore.convertQuoteToOrder.bind(dataStore),
  };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const refresh = useCallback(() => {
    setUsers(dataStore.getUsers());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    users,
    refresh,
    saveUser: dataStore.saveUser.bind(dataStore),
    deleteUser: dataStore.deleteUser.bind(dataStore),
  };
}

export function useSettingsCategory(categoryKey: string) {
  const [items, setItems] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setItems(dataStore.getCategoryItems(categoryKey));
  }, [categoryKey]);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    items,
    refresh,
    addItem: (item: string) => dataStore.addCategoryItem(categoryKey, item),
    updateItem: (oldItem: string, newItem: string) => dataStore.updateCategoryItem(categoryKey, oldItem, newItem),
    deleteItem: (item: string) => dataStore.deleteCategoryItem(categoryKey, item),
    reorderItems: (startIndex: number, endIndex: number) => dataStore.reorderCategoryItems(categoryKey, startIndex, endIndex),
  };
}

export function useCashFlow() {
  const [records, setRecords] = useState<DailyCashRecord[]>([]);

  const refresh = useCallback(() => {
    setRecords(dataStore.getCashFlowRecords());
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    records,
    refresh,
    saveRecord: (rec: DailyCashRecord) => dataStore.saveCashFlowRecord(rec),
  };
}
