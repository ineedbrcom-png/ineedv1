/**
 * @fileOverview A content moderation AI flow for iNeed Marketplace.
 *
 * - moderateListingContent - A function that analyzes listing content and classifies it.
 * - ModerateListingInput - The input type for the moderateListingContent function.
 * - ModerateListingOutput - The return type for the moderateListingContent function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit/zod';

// Initialize Genkit with the Google AI plugin for the functions environment
const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

const ModerateListingInputSchema = z.object({
  title: z.string().describe('The title of the listing.'),
  description: z.string().describe('The description of the listing.'),
});
export type ModerateListingInput = z.infer<typeof ModerateListingInputSchema>;

const ModerateListingOutputSchema = z.object({
  classification: z
    .enum(['published', 'review', 'rejected'])
    .describe(
      "The classification of the content. 'published' for safe content, 'review' for content that needs manual review, and 'rejected' for content that violates the policy."
    ),
});
export type ModerateListingOutput = z.infer<typeof ModerateListingOutputSchema>;


const contentModerationFlow = ai.defineFlow(
  {
    name: 'contentModerationFlow',
    inputSchema: ModerateListingInputSchema,
    outputSchema: ModerateListingOutputSchema,
  },
  async (input) => {
    const prompt = `You are an experienced content moderator for a marketplace called iNeed. Your task is to analyze the title and description of a new listing and classify it strictly into one of three categories: 'published', 'review', or 'rejected'.

    Prohibited Content Policies:
    - Illegal drugs, controlled substances, and related paraphernalia.
    - Firearms, ammunition, explosives, and accessories.
    - Any content that exploits or endangers minors (pedophilia, child labor).
    - Hate speech, harassment, or violence against individuals or groups.
    - Stolen, counterfeit, or smuggled items.
    - Sexual services and pornographic content.
    - Personal information of third parties shared without consent.
    - Spam, pyramid schemes, and misleading offers.

    Classification Instructions:
    - rejected: Use this category for any content that clearly violates the policies above. Be strict.
    - review: Use this category if the content is ambiguous or suspicious, but not a clear violation. For example, the mention of a "knife" could be for a "kitchen knife sharpening" service (published) or for the sale of a weapon (rejected). In such cases, mark as 'review'.
    - published: Use this category for all other requests that do not fall into 'rejected' or 'review'.

    Analyze the following content:
    Title: ${input.title}
    Description: ${input.description}`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'gemini-1.5-flash',
      output: {
        schema: ModerateListingOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);

/**
 * Executes the content moderation flow.
 * This function is exported to be used by the Firestore triggers.
 * @param input The listing data to moderate.
 * @returns The moderation result.
 */
export async function moderateListingContent(
  input: ModerateListingInput
): Promise<ModerateListingOutput> {
  return contentModerationFlow(input);
}
