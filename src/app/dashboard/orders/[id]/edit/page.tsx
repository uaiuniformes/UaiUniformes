'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrderForm } from '@/components/orders/order-form';
import { mockOrders } from '@/lib/mock-data';
import { dataStore } from '@/lib/data-store';
import { useLoader } from '@/hooks/use-loader';
import type { Order } from '@/lib/types';

export default function EditOrderPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { hideLoader } = useLoader();

  useEffect(() => {
    if (id) {
      const foundOrder = dataStore.getOrderById(id) || mockOrders.find(o => o.id === `ORD${id}` || o.id === id || o.id.replace('ORD', '') === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
    setLoading(false);
    hideLoader();
  }, [id, hideLoader]);

  if (loading) {
    return <div className="p-4">Carregando dados do pedido...</div>;
  }

  if (!order) {
    return <div className="p-4">Pedido não encontrado.</div>;
  }

  return <OrderForm existingOrder={order} />;
}
