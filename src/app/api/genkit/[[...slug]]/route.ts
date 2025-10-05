/**
 * @fileoverview This file creates a Next.js API route handler for Genkit.
 * It manually performs an App Check verification before passing the request
 * to the Genkit handler.
 */
import { handleGenkitRequest } from '@genkit-ai/next/api';
import { NextRequest } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

// Ensure all flows are loaded.
import '@/ai/dev';

const genkitHandler = handleGenkitRequest();

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

  // If verification is successful, return null to proceed.
  return null;
}

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const authError = await performAppCheck(req);
  if (authError) {
    return authError;
  }
  // Pass the request to the standard Genkit handler.
  return genkitHandler(req, { params });
};

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
    const authError = await performAppCheck(req);
    if (authError) {
        return authError;
    }
    return genkitHandler(req, { params });
}

export async function OPTIONS(req: NextRequest, { params }: { params: { slug: string[] } }) {
    return genkitHandler(req, { params });
}
