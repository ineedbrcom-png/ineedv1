
// src/app/api/genkit/[[...slug]]/route.ts

import { handleGenkitRequest } from '@genkit-ai/next';
import '@/ai/dev'; // Garante que todos os fluxos Genkit sejam carregados e registrados

// Recomendado para rotas de API que usam funcionalidades dinâmicas do servidor
export const dynamic = 'force-dynamic';

/**
 * Exporta diretamente as funções GET, POST e OPTIONS fornecidas pelo manipulador Genkit.
 * Esta é a forma recomendada e deve lidar com os tipos de contexto automaticamente.
 */
export const { GET, POST, OPTIONS } = handleGenkitRequest();
