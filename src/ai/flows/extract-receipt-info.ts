
'use server';

/**
 * @fileOverview A flow to extract transaction information from a receipt image or a text string.
 * 
 * - extractReceiptInfo - A function that analyzes a receipt photo or text and extracts key details.
 * - ExtractReceiptInfoInput - The input type for the function.
 * - ExtractReceiptInfoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { PaymentType } from '@/lib/types';

const paymentMethods: readonly [PaymentType, ...PaymentType[]] = ['Dinheiro', 'Transferencia/ Pix', 'Cartão', 'Boleto', 'Cheque'];

const ExtractReceiptInfoInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  text: z.string().optional().describe('A text description of a transaction, spoken by the user.'),
});
export type ExtractReceiptInfoInput = z.infer<typeof ExtractReceiptInfoInputSchema>;

const ExtractReceiptInfoOutputSchema = z.object({
  description: z.string().describe('A brief summary of the transaction. E.g., "Compra de materiais de escritório" or "Pagamento de conta de luz".'),
  value: z.number().describe('The total value of the transaction found in the receipt.'),
  paymentMethod: z.enum(paymentMethods).optional().describe('The method of payment if identifiable (e.g., "Cartão", "Dinheiro").'),
});
export type ExtractReceiptInfoOutput = z.infer<typeof ExtractReceiptInfoOutputSchema>;

export async function extractReceiptInfo(input: ExtractReceiptInfoInput): Promise<ExtractReceiptInfoOutput> {
  return extractReceiptInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptInfoPrompt',
  input: {schema: ExtractReceiptInfoInputSchema},
  output: {schema: ExtractReceiptInfoOutputSchema},
  prompt: `Analyze the following input, which can be either a receipt image or a text string, and extract the key information.

Your goal is to identify three pieces of information:
1.  A short, relevant description of the transaction. If it's a store, use the store name. If it's a bill, identify the service.
2.  The final total value of the transaction.
3.  The payment method, if it is visible or mentioned. It must be one of the following values: ${paymentMethods.join(', ')}.

Return the information in the specified JSON format.

{{#if photoDataUri}}
Receipt Image:
{{media url=photoDataUri}}
{{/if}}

{{#if text}}
Transaction Text:
"{{text}}"
{{/if}}
`,
});

const extractReceiptInfoFlow = ai.defineFlow(
  {
    name: 'extractReceiptInfoFlow',
    inputSchema: ExtractReceiptInfoInputSchema,
    outputSchema: ExtractReceiptInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
