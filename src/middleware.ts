
import { NextRequest, NextResponse } from 'next/server';
import { initializeAdminApp, getAdminApp } from '@/lib/firebase-admin';

// Garante que o app admin seja inicializado
initializeAdminApp();

export async function middleware(request: NextRequest) {
  // Executa este middleware apenas para as rotas da API do Genkit
  if (request.nextUrl.pathname.startsWith('/api/genkit/')) {
    const appCheckToken = request.headers.get('X-Firebase-AppCheck');

    // Se não houver token, bloqueia a requisição
    if (!appCheckToken) {
      return new Response('Unauthorized - Missing App Check token', { status: 401 });
    }

    try {
      // Pega a instância do app admin para fazer a verificação
      const adminApp = getAdminApp();
      if (adminApp) {
        await adminApp.appCheck().verifyToken(appCheckToken);
        // Token é válido, a requisição pode continuar para a rota do Genkit
        return NextResponse.next();
      }
      throw new Error('Admin SDK not initialized');
    } catch (err) {
      // Se o token for inválido, a requisição é bloqueada.
      return new Response('Unauthorized - Invalid App Check token', { status: 401 });
    }
  }

  // Para todas as outras rotas, não faz nada
  return NextResponse.next();
}
