
/**
 * @fileoverview Este arquivo cria um manipulador de rota de API do Next.js para o Genkit.
 * Esta é a implementação mais simples possível para garantir que o build funcione.
 * A segurança do App Check pode ser adicionada depois que o deploy for bem-sucedido.
 */
import { handleGenkitRequest } from '@genkit-ai/next';

// Garante que todos os fluxos sejam carregados.
import '@/ai/dev';

// Recomendado para rotas de API que usam funcionalidades dinâmicas do servidor.
export const dynamic = 'force-dynamic';

/**
 * Exporta diretamente as funções GET, POST e OPTIONS fornecidas pelo manipulador Genkit.
 * Esta é a forma recomendada pela biblioteca para delegar todo o roteamento para o Genkit.
 */
export const { GET, POST, OPTIONS } = handleGenkitRequest();
