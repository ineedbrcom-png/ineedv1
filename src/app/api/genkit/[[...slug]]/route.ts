import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import '@/ai/dev'; // Ensure all flows are loaded

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

async function handler(req: NextRequest, context: { params: { slug: string[] } }) {
  const authError = await performAppCheck(req);
  if (authError) {
    return authError;
  }

  const flowName = context.params.slug.join('/');
  const flow = await ai.registry.lookupAction(`/flow/${flowName}`);

  if (!flow) {
    return new Response(`Flow not found: ${flowName}`, { status: 404 });
  }

  const input = await req.json();

  try {
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