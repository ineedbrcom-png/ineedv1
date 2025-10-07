
import { config } from 'dotenv';

// Garante que o dotenv só seja executado em ambientes de não-produção.
// Em produção, as variáveis de ambiente são fornecidas pelo serviço de hospedagem.
if (process.env.NODE_ENV !== 'production') {
  config();
}

// Importa os fluxos de IA para que eles sejam registrados no Genkit.
import '@/ai/flows/content-moderation';
import '@/ai/flows/service-provider-recommendation';
import '@/ai/flows/listing-description-refinement';
