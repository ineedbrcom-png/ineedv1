/**
 * @fileoverview This file creates a Next.js API route handler for Genkit.
 * It manually performs an App Check verification before passing the request
 * to the Genkit handler. This approach avoids using Next.js middleware, which
 * runs in an Edge environment incompatible with the Firebase Admin SDK.
 */
import { ai } from '@/ai/genkit';
import { NextRequest } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

// This is the actual handler that will process Genkit requests.
// We get it from the standard Genkit Next.js plugin.
const genkitHandler = ai.getHttpRequestHandler();

// We create a new POST function that wraps the Genkit handler with our security check.
export async function POST(req: NextRequest) {
  // --- START OF APP CHECK VERIFICATION ---
  const appCheckToken = req.headers.get('X-Firebase-AppCheck');

  if (!appCheckToken) {
    return new Response('Unauthorized - Missing App Check token', { status: 401 });
  }

  try {
    // Get the initialized Firebase Admin SDK instance.
    const adminApp = getAdminApp();
    if (!adminApp) {
      // This should not happen if initialization is successful, but it's a good safeguard.
      console.error('App Check failed: Admin SDK not initialized.');
      return new Response('Internal Server Error', { status: 500 });
    }
    // Verify the token using the Admin SDK.
    // If the token is invalid, this will throw an error, which is caught below.
    await adminApp.appCheck().verifyToken(appCheckToken);
  } catch (err) {
    console.error('App Check verification failed:', err);
    return new Response('Unauthorized - Invalid App Check token', { status: 401 });
  }
  // --- END OF APP CHECK VERIFICATION ---

  // If verification is successful, pass the original request to the Genkit handler.
  return genkitHandler(req);
};

// We also export the handler for other HTTP methods Genkit might use.
export const GET = genkitHandler;
export const OPTIONS = genkitHandler;
