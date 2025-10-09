'use server';
/**
 * @fileOverview An AI agent that generates creative Instagram captions.
 *
 * - generateInstagramCaptions - A function that handles the generation of Instagram captions.
 * - GenerateInstagramCaptionsInput - The input type for the generateInstagramCaptions function.
 * - GenerateInstagramCaptionsOutput - The return type for the generateInstagramCaptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInstagramCaptionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the Instagram post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  topic: z.string().describe('The topic of the Instagram post.'),
});
export type GenerateInstagramCaptionsInput = z.infer<typeof GenerateInstagramCaptionsInputSchema>;

const GenerateInstagramCaptionsOutputSchema = z.object({
  captions: z.array(z.string()).describe('Three creative caption ideas for the Instagram post.'),
});
export type GenerateInstagramCaptionsOutput = z.infer<typeof GenerateInstagramCaptionsOutputSchema>;

export async function generateInstagramCaptions(input: GenerateInstagramCaptionsInput): Promise<GenerateInstagramCaptionsOutput> {
  return generateInstagramCaptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInstagramCaptionsPrompt',
  input: {schema: GenerateInstagramCaptionsInputSchema},
  output: {schema: GenerateInstagramCaptionsOutputSchema},
  prompt: `You are a creative social media manager who specializes in writing Instagram captions.

  Generate three creative and engaging caption ideas for an Instagram post about the following topic:
  {{topic}}

  Use the following image as inspiration:
  {{media url=photoDataUri}}

  Return the captions as a JSON array.
  `,
});

const generateInstagramCaptionsFlow = ai.defineFlow(
  {
    name: 'generateInstagramCaptionsFlow',
    inputSchema: GenerateInstagramCaptionsInputSchema,
    outputSchema: GenerateInstagramCaptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
