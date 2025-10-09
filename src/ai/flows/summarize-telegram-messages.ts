'use server';

/**
 * @fileOverview Summarizes new messages from a Telegram channel using Gemini Pro.
 *
 * - summarizeTelegramMessages - A function that handles the summarization process.
 * - SummarizeTelegramMessagesInput - The input type for the summarizeTelegramMessages function.
 * - SummarizeTelegramMessagesOutput - The return type for the summarizeTelegramMessages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTelegramMessagesInputSchema = z.object({
  telegramMessage: z.string().describe('The new message from the Telegram channel.'),
});
export type SummarizeTelegramMessagesInput = z.infer<typeof SummarizeTelegramMessagesInputSchema>;

const SummarizeTelegramMessagesOutputSchema = z.object({
  summary: z.string().describe('The summary of the Telegram message.'),
});
export type SummarizeTelegramMessagesOutput = z.infer<typeof SummarizeTelegramMessagesOutputSchema>;

export async function summarizeTelegramMessages(input: SummarizeTelegramMessagesInput): Promise<SummarizeTelegramMessagesOutput> {
  return summarizeTelegramMessagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTelegramMessagesPrompt',
  input: {schema: SummarizeTelegramMessagesInputSchema},
  output: {schema: SummarizeTelegramMessagesOutputSchema},
  prompt: `Summarize the following Telegram message:

{{{telegramMessage}}}`,
});

const summarizeTelegramMessagesFlow = ai.defineFlow(
  {
    name: 'summarizeTelegramMessagesFlow',
    inputSchema: SummarizeTelegramMessagesInputSchema,
    outputSchema: SummarizeTelegramMessagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
