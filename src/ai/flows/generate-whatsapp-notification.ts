
'use server';

/**
 * @fileOverview A flow to generate personalized WhatsApp notifications for customers based on their order status.
 *
 * - generateWhatsAppNotification - A function that determines and sends appropriate WhatsApp notifications to customers.
 * - GenerateWhatsAppNotificationInput - The input type for the generateWhatsAppNotification function.
 * - GenerateWhatsAppNotificationOutput - The return type for the generateWhatsAppNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWhatsAppNotificationInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerPhoneNumber: z.string().describe('The customer phone number with DDD.'),
  orderId: z.string().describe('The ID of the order.'),
  currentStage: z.enum([
    'Corte',
    'Estampagem',
    'Separação',
    'Costura',
    'Arremate',
    'Finalizado',
    'Correção',
    'Cancelado',
    'Entregue',
    'Reposição de Corte',
    'Deletado',
  ]).describe('The current stage of the order.'),
  orderHistory: z.string().describe('The history of the order.'),
  preferences: z.string().optional().describe('Customer preferences for notifications, if available.'),
});
export type GenerateWhatsAppNotificationInput = z.infer<typeof GenerateWhatsAppNotificationInputSchema>;

const GenerateWhatsAppNotificationOutputSchema = z.object({
  sendNotification: z.boolean().describe('Whether a notification should be sent.'),
  notificationMessage: z.string().optional().describe('The message to send to the customer, if any.'),
  reason: z.string().optional().describe('The reason why notification was not sent, if applicable.')
});
export type GenerateWhatsAppNotificationOutput = z.infer<typeof GenerateWhatsAppNotificationOutputSchema>;

export async function generateWhatsAppNotification(input: GenerateWhatsAppNotificationInput): Promise<GenerateWhatsAppNotificationOutput> {
  return generateWhatsAppNotificationFlow(input);
}

const generateWhatsAppNotificationPrompt = ai.definePrompt({
  name: 'generateWhatsAppNotificationPrompt',
  input: {schema: GenerateWhatsAppNotificationInputSchema},
  output: {schema: GenerateWhatsAppNotificationOutputSchema},
  prompt: `You are an AI assistant that helps determine if a WhatsApp notification should be sent to a customer based on their order status.

  Consider the following information:
  - Customer Name: {{customerName}}
  - Customer Phone Number: {{customerPhoneNumber}}
  - Order ID: {{orderId}}
  - Current Stage: {{currentStage}}
  - Order History: {{orderHistory}}
  - Customer Preferences: {{preferences}}

  Determine if a notification should be sent, and if so, generate a personalized message.

  Output in JSON format:
  {
    "sendNotification": true/false,
    "notificationMessage": "The personalized notification message, if sendNotification is true",
    "reason": "The reason why notification was not sent, if sendNotification is false"
  }

  Examples:
  Input:
  {
    "customerName": "John Doe",
    "customerPhoneNumber": "5511999999999",
    "orderId": "12345",
    "currentStage": "Em Corte",
    "orderHistory": "Pedido Recebido, Em Corte",
    "preferences": ""
  }
  Output:
  {
    "sendNotification": true,
    "notificationMessage": "Olá, John Doe! Seu pedido 12345 acaba de entrar na etapa de corte.",
    "reason": null
  }

  Input:
  {
    "customerName": "Jane Smith",
    "customerPhoneNumber": "5521888888888",
    "orderId": "67890",
    "currentStage": "Pedido Recebido",
    "orderHistory": "Pedido Recebido",
    "preferences": "Não enviar notificações para 'Pedido Recebido'"
  }
  Output:
  {
    "sendNotification": false,
    "notificationMessage": null,
    "reason": "Customer preference to not receive notifications for 'Pedido Recebido'"
  }

  Based on the input, determine whether to send a notification and the content.`, // Improved prompt
});

const generateWhatsAppNotificationFlow = ai.defineFlow(
  {
    name: 'generateWhatsAppNotificationFlow',
    inputSchema: GenerateWhatsAppNotificationInputSchema,
    outputSchema: GenerateWhatsAppNotificationOutputSchema,
  },
  async input => {
    const {output} = await generateWhatsAppNotificationPrompt(input);
    return output!;
  }
);
