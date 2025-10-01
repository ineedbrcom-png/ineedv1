'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending service providers to users based on their listing details and preferences.
 *
 * - `getServiceProviderRecommendations` - A function that takes a service listing description and returns a list of recommended service providers.
 * - `ServiceProviderRecommendationInput` - The input type for the `getServiceProviderRecommendations` function.
 * - `ServiceProviderRecommendationOutput` - The output type for the `getServiceProviderRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ServiceProviderRecommendationInputSchema = z.object({
  listingDescription: z
    .string()
    .describe("The description of the service listing, including requirements, budget, and location."),
});
export type ServiceProviderRecommendationInput = z.infer<typeof ServiceProviderRecommendationInputSchema>;

const ServiceProviderRecommendationOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      providerName: z.string().describe("The name of the service provider."),
      providerDescription: z.string().describe("A short description of the service provider's skills and experience."),
      matchScore: z.number().describe("A score indicating how well the service provider matches the listing (0-1)."),
    })
  ).describe("A list of recommended service providers, ordered by match score."),
});
export type ServiceProviderRecommendationOutput = z.infer<typeof ServiceProviderRecommendationOutputSchema>;

export async function getServiceProviderRecommendations(input: ServiceProviderRecommendationInput): Promise<ServiceProviderRecommendationOutput> {
  return serviceProviderRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'serviceProviderRecommendationPrompt',
  input: {schema: ServiceProviderRecommendationInputSchema},
  output: {schema: ServiceProviderRecommendationOutputSchema},
  prompt: `You are an expert in matching service providers with potential clients.

  Given the following service listing description, recommend a list of service providers that would be a good fit.  Include a match score (0-1) that represents how closely the provider fits the listing. Order the list by match score, highest to lowest.
  Listing Description: {{{listingDescription}}}
  `,
});

const serviceProviderRecommendationFlow = ai.defineFlow(
  {
    name: 'serviceProviderRecommendationFlow',
    inputSchema: ServiceProviderRecommendationInputSchema,
    outputSchema: ServiceProviderRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
