
import { handleGenkitRequest } from '@genkit-ai/next';
import '@/ai/dev'; // Garante que todos os fluxos Genkit sejam carregados e registrados

// Recomendado para rotas de API que usam funcionalidades dinâmicas do servidor
export const dynamic = 'force-dynamic';

/**
 * Exporta diretamente as funções GET, POST e OPTIONS fornecidas pelo manipulador Genkit.
 * Isso resolve o conflito de tipos (Type error: RouteContext) e o erro de módulo não encontrado, 
 * pois a biblioteca fornece as assinaturas exatas esperadas pelo Next.js e gerencia a lógica de
 * roteamento dos fluxos de IA.
 */
export const { GET, POST, OPTIONS } = handleGenkitRequest();

