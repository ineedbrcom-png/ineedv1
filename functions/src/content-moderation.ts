
/**
 * @fileoverview Content moderation flow for listings.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z, ZodType } from 'zod'; // Adiciona a importação de ZodType

// Initialize Genkit with the Google AI plugin for the functions environment
const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

// CORRIGIDO: Faz o cast explícito para ZodType<any>
const ModerateListingInputSchema = z.object({
  title: z.string().describe('The title of the listing.'),
  description: z.string().describe('The description of the listing.'),
}) as ZodType<any>;

// CORRIGIDO: Faz o cast explícito para ZodType<any>
const ModerateListingOutputSchema = z.object({
  classification: z
    .enum(['publicado', 'revisao', 'rejeitado'])
    .describe(
      "The classification of the content. 'publicado' for safe content, 'revisao' for content that needs manual review, and 'rejeitado' for content that violates the policy."
    ),
}) as ZodType<any>;

const contentModerationFlow = ai.defineFlow(
    {
      name: 'contentModerationFlow',
      inputSchema: ModerateListingInputSchema,
      outputSchema: ModerateListingOutputSchema,
    },
    async (input: any) => { // Usa 'any' no input aqui, pois o schema já garante o tipo
        const prompt = `Você é um moderador de conteúdo experiente... (resto do prompt)`;
        const response = await ai.generateText({
            prompt,
            input,
        });
        
        try {
            const output = JSON.parse(response.text());
            return output;
        } catch (e) {
            console.error("Erro ao analisar a saída da IA como JSON:", response.text());
            return { classification: 'revisao' };
        }
    }
);

export async function moderateListingContent(input: z.infer<typeof ModerateListingInputSchema>) {
    return await contentModerationFlow(input);
}
