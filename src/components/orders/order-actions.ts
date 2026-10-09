
'use server';

import { generateWhatsAppNotification } from '@/ai/flows/generate-whatsapp-notification';
import { generateInternalNotification } from '@/ai/flows/generate-internal-notification';
import { mockCustomers } from '@/lib/mock-data';
import type { Order } from '@/lib/types';

export async function sendOrderStatusNotification(order: Order, isOverdue: boolean = false) {
  const customer = mockCustomers.find(c => c.id === order.customerId);
  let customerMessage = null;
  let customerSuccess = true;
  let internalMessage = null;
  let internalSuccess = true;

  if (!customer) {
    return { 
        success: false, 
        customerMessage: 'Cliente não encontrado.', 
        internalMessage: 'Cliente não encontrado, notificação interna falhou.' 
    };
  }

  // 1. Gera a notificação para o cliente (se habilitado)
  if (order.notifications) {
    try {
      const result = await generateWhatsAppNotification({
        customerName: customer.responsible,
        customerPhoneNumber: customer.phone,
        orderId: order.id,
        currentStage: order.stage,
        orderHistory: `O pedido mudou para a etapa: ${order.stage}`,
        preferences: '',
      });

      if (result.sendNotification && result.notificationMessage) {
        console.log(`Generated customer notification for ${customer.phone}: ${result.notificationMessage}`);
        customerMessage = `Mensagem para cliente: "${result.notificationMessage}"`;
      } else {
        console.log(`Customer notification skipped for order ${order.id}. Reason: ${result.reason}`);
        customerMessage = `Notificação para cliente não enviada. Motivo: ${result.reason || 'Não especificado.'}`;
      }
    } catch (error) {
      console.error('Failed to generate customer notification:', error);
      customerSuccess = false;
      customerMessage = 'Falha ao gerar a mensagem para o cliente.';
    }
  } else {
    customerMessage = 'Notificações para cliente desativadas neste pedido.';
  }

  // 2. Gera a notificação interna para o próximo operador (sempre)
  try {
    const internalResult = await generateInternalNotification({
      orderId: order.id,
      customerName: order.customerName,
      nextStage: order.stage,
    });

    if (internalResult.notificationMessage) {
       console.log(`Generated internal notification: ${internalResult.notificationMessage}`);
       internalMessage = `Notificação interna: "${internalResult.notificationMessage}"`;
       if (isOverdue) {
           const overdueMessage = ` ATENÇÃO: Este pedido estava atrasado na etapa anterior!`;
           internalMessage += overdueMessage;
           console.log(`Added overdue alert to internal notification: ${overdueMessage}`);
       }
    } else {
        internalSuccess = false;
        internalMessage = "Não foi possível gerar a notificação interna."
    }
  } catch (error) {
     console.error('Failed to generate internal notification:', error);
     internalSuccess = false;
     internalMessage = 'Falha ao gerar a mensagem interna.';
  }

  return { 
    success: customerSuccess && internalSuccess, 
    customerMessage,
    internalMessage,
  };
}
