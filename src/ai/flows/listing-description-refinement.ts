'use server';

/**
 * @fileOverview Refines a service or product description using AI to be clear, concise, and appealing.
 *
 * - refineListingDescription - A function that refines the listing description.
 * - RefineListingDescriptionInput - The input type for the refineListingDescription function.
 * - RefineListingDescriptionOutput - The return type for the refineListingDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineListingDescriptionInputSchema = z.object({
  description: z
    .string()
    .describe('The original description of the service or product.'),
});
export type RefineListingDescriptionInput = z.infer<
  typeof RefineListingDescriptionInputSchema
>;

const RefineListingDescriptionOutputSchema = z.object({
  refinedDescription: z
    .string()
    .describe('The refined description of the service or product.'),
});
export type RefineListingDescriptionOutput = z.infer<
  typeof RefineListingDescriptionOutputSchema
>;

export async function refineListingDescription(
  input: RefineListingDescriptionInput
): Promise<RefineListingDescriptionOutput> {
  return refineListingDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineListingDescriptionPrompt',
  input: {schema: RefineListingDescriptionInputSchema},
  output: {schema: RefineListingDescriptionOutputSchema},
  prompt: `You are an expert marketing assistant specializing in refining product and service descriptions. Your goal is to make descriptions clear, concise, and appealing to potential clients or providers.

Original Description: {{{description}}}

Refine the above description to meet these goals. Return only the refined description. Do not include any introductory or concluding remarks. Focus on improving clarity, conciseness and appeal.`,
});

const refineListingDescriptionFlow = ai.defineFlow(
  {
    name: 'refineListingDescriptionFlow',
    inputSchema: RefineListingDescriptionInputSchema,
    outputSchema: RefineListingDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
