
'use server';
/**
 * @fileOverview A content moderation AI flow for iNeed Marketplace.
 *
 * - moderateListingContent - A function that analyzes listing content and classifies it.
 * - ModerateListingInput - The input type for the moderateListingContent function.
 * - ModerateListingOutput - The return type for the moderateListingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {runFlow} from '@genkit-ai/flow';

const ModerateListingInputSchema = z.object({
  title: z.string().describe('The title of the listing.'),
  description: z.string().describe('The description of the listing.'),
});
export type ModerateListingInput = z.infer<typeof ModerateListingInputSchema>;

const ModerateListingOutputSchema = z.object({
  classification: z
    .enum(['publicado', 'revisao', 'rejeitado'])
    .describe(
      "A classificação do conteúdo. 'publicado' para conteúdo seguro, 'revisao' para conteúdo que precisa de revisão manual, e 'rejeitado' para conteúdo que viola a política."
    ),
});
export type ModerateListingOutput = z.infer<typeof ModerateListingOutputSchema>;

export async function moderateListingContent(
  input: ModerateListingInput
): Promise<ModerateListingOutput> {
  return runFlow(contentModerationFlow, input);
}

const prompt = ai.definePrompt({
  name: 'contentModerationPrompt',
  input: {schema: ModerateListingInputSchema},
  output: {schema: ModerateListingOutputSchema},
  prompt: `Você é um moderador de conteúdo experiente para um marketplace chamado iNeed. Sua tarefa é analisar o título e a descrição de um novo pedido e classificá-lo estritamente em uma das três categorias: 'publicado', 'revisao' ou 'rejeitado'.

Políticas de Conteúdo Proibido:
- Drogas ilícitas, substâncias controladas e parafernálias relacionadas.
- Armas de fogo, munições, explosivos e acessórios.
- Qualquer conteúdo que explore ou ponha em perigo menores (pedofilia, trabalho infantil).
- Discurso de ódio, assédio ou violência contra indivíduos ou grupos.
- Itens roubados, falsificados ou contrabandeados.
- Serviços sexuais e conteúdo pornográfico.
- Informações pessoais de terceiros compartilhadas sem consentimento.
- Spam, esquemas de pirâmide e ofertas enganosas.

Instruções de Classificação:
- rejeitado: Use esta categoria para qualquer conteúdo que viole claramente as políticas acima. Seja rigoroso.
- revisao: Use esta categoria se o conteúdo for ambíguo ou suspeito, mas não uma violação clara. Por exemplo, a menção de uma "faca" pode ser para um serviço de "amolar facas de cozinha" (publicado) ou para a venda de uma arma branca (rejeitado). Nesses casos, marque como 'revisao'.
- publicado: Use esta categoria para todos os outros pedidos que não se enquadram em 'rejeitado' ou 'revisao'.

Analise o seguinte conteúdo:
Título: {{{title}}}
Descrição: {{{description}}}`,
});

const contentModerationFlow = ai.defineFlow(
  {
    name: 'contentModerationFlow',
    inputSchema: ModerateListingInputSchema,
    outputSchema: ModerateListingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
