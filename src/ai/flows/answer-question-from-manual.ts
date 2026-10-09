
'use server';

/**
 * @fileOverview A flow to answer user questions based on a provided system manual.
 * 
 * - answerQuestionFromManual - A function that takes a user's question, the system manual, and the user's role to provide a context-aware answer.
 * - AnswerQuestionInput - The input type for the function.
 * - AnswerQuestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the system.'),
  manual: z.string().describe('The full text content of the system manual.'),
  userRole: z.enum(['Administrador', 'Gerente', 'Vendedor', 'Cortadeira']).describe('The permission level of the user asking the question.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The generated answer in markdown format.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestionFromManual(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionFromManualPrompt',
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  prompt: `
You are a helpful AI assistant for a production management system. Your task is to answer user questions based ONLY on the provided system manual.

**CRITICAL INSTRUCTIONS:**
1.  **Base all answers strictly on the provided manual.** Do not invent features or provide information not present in the text.
2.  **Consider the user's role ({{userRole}}).** If the user asks about a feature they do not have permission to access according to the manual, you MUST inform them that their role does not permit access to that functionality, instead of explaining how it works. For example, a 'Cortadeira' only has access to the 'Corte' page.
3.  **Be concise and direct.** Provide clear, step-by-step instructions when possible.
4.  **Format your answers using simple Markdown** for clarity (e.g., bold for emphasis, lists for steps). Do not use headings.

**User's Question:** "{{question}}"

**System Manual for Reference:**
---
{{{manual}}}
---

Based on the manual and the user's role, generate a helpful and accurate answer.
`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
