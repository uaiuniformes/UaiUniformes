
'use server';

/**
 * @fileOverview A flow to generate internal notifications for production operators.
 *
 * - generateInternalNotification - A function that creates a notification message for the team of the next production stage.
 * - GenerateInternalNotificationInput - The input type for the function.
 * - GenerateInternalNotificationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInternalNotificationInputSchema = z.object({
  orderId: z.string().describe('The ID of the order.'),
  customerName: z.string().describe('The name of the customer.'),
  nextStage: z.enum([
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
    'Deletado'
  ]).describe('The stage the order is moving to.'),
});
export type GenerateInternalNotificationInput = z.infer<typeof GenerateInternalNotificationInputSchema>;

const GenerateInternalNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The notification message for the internal team.'),
});
export type GenerateInternalNotificationOutput = z.infer<typeof GenerateInternalNotificationOutputSchema>;


export async function generateInternalNotification(input: GenerateInternalNotificationInput): Promise<GenerateInternalNotificationOutput> {
  return generateInternalNotificationFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateInternalNotificationPrompt',
  input: {schema: GenerateInternalNotificationInputSchema},
  output: {schema: GenerateInternalNotificationOutputSchema},
  prompt: `You are an assistant for a clothing manufacturing company. Your task is to generate a concise and direct internal notification message to alert the team responsible for a specific production stage that a new order has arrived in their queue.

Context:
- Order ID: {{orderId}}
- Customer Name: {{customerName}}
- The order is now entering this stage: {{nextStage}}

The message should be in Portuguese.

Example:
Input:
{
  "orderId": "ORD007",
  "customerName": "Stark Industries",
  "nextStage": "Estampagem"
}
Output:
{
  "notificationMessage": "Pedido #007 (Stark Industries) chegou na Estampagem."
}

Generate the notification message based on the provided input.`,
});


const generateInternalNotificationFlow = ai.defineFlow(
  {
    name: 'generateInternalNotificationFlow',
    inputSchema: GenerateInternalNotificationInputSchema,
    outputSchema: GenerateInternalNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
