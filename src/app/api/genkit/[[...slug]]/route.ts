import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import '@/ai/dev'; // Ensure all flows are loaded

// === CORREÇÃO 1: Definir o tipo exato esperado pelo Next.js para [[...slug]] ===
interface RouteContext {
    params: {
        // 'slug' deve ser opcional ('?') e um array de strings ('string[]')
        slug?: string[];
    };
}
// =============================================================================

async function performAppCheck(req: NextRequest): Promise<Response | null> {
  const appCheckToken = req.headers.get('X-Firebase-AppCheck');

  if (!appCheckToken) {
    return new Response('Unauthorized - Missing App Check token', { status: 401 });
  }

  try {
    const adminApp = getAdminApp();
    if (!adminApp) {
      console.error('App Check failed: Admin SDK not initialized.');
      return new Response('Internal Server Error', { status: 500 });
    }
    await adminApp.appCheck().verifyToken(appCheckToken);
  } catch (err) {
    console.error('App Check verification failed:', err);
    return new Response('Unauthorized - Invalid App Check token', { status: 401 });
  }

  return null;
}

// === CORREÇÃO 2: Aplicar o tipo correto ao segundo argumento ===
async function handler(req: NextRequest, context: RouteContext) {
// =================================================================

  const authError = await performAppCheck(req);
  if (authError) {
    return authError;
  }

  // A extração do nome do fluxo agora é mais simples, pois o tipo está correto
  const flowName = context.params.slug?.join('/') || '';

  if (!flowName) {
    return new Response('Flow not specified', { status: 400 });
  }
    
  const flow = await ai.registry.lookupAction(`/flow/${flowName}`);

  if (!flow) {
    return new Response(`Flow not found: ${flowName}`, { status: 404 });
  }

  // === CORREÇÃO 3: Ler o input de forma segura (evitar erros em GET/OPTIONS) ===
  let input: any; // Pode ser undefined se não houver corpo
  const contentLength = req.headers.get('content-length');

  // Tenta ler o JSON apenas se houver conteúdo na requisição
  if (contentLength && Number(contentLength) > 0) {
    try {
        input = await req.json();
    } catch (err) {
        // Se falhar ao analisar o JSON (ex: JSON inválido)
        return new Response('Invalid JSON input', { status: 400 });
    }
  }
  // =============================================================================

  try {
    // Executa o fluxo (input pode ser undefined)
    const result = await flow.run(input);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`Error running flow ${flowName}:`, err);
    return new Response(`Error running flow: ${err.message}`, { status: 500 });
  }
}

export const POST = handler;
export const GET = handler;
export const OPTIONS = handler;
