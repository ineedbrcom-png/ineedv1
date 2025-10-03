
/**
 * @fileoverview This file creates a Next.js API route handler for Genkit.
 * It uses the App Check middleware to protect the Genkit API routes.
 */
import {nextHandler} from '@genkit-ai/next';
import {appCheck} from '@genkit-ai/next/appcheck';

export const POST = nextHandler({
  middleware: [
    appCheck({
      // The Firebase App Check service to use.
      // You can create a service by following the instructions at
      // https://firebase.google.com/docs/app-check/web/service-worker-provider
      service:
        'projects/studio-9893157227-94cea/services/firebaseappcheck.googleapis.com',
    }),
  ],
});
