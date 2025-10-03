
/**
 * @fileoverview This file creates a Next.js API route handler for Genkit.
 * It uses the App Check middleware to protect the Genkit API routes,
 * enforcing that all requests from the client have a valid App Check token.
 */
import {nextHandler} from '@genkit-ai/next';
import {appCheck} from '@genkit-ai/next/appcheck';

// This configuration ensures that all requests to the Genkit API endpoints
// (which power the AI flows) are intercepted and validated.
export const POST = nextHandler({
  middleware: [
    // The appCheck middleware acts as a gatekeeper. It inspects incoming
    // requests for a valid App Check token. If the token is missing or
    // invalid, the request is rejected with an error, and the Genkit flow
    // is never executed. This is the server-side enforcement equivalent
    // to `enforceAppCheck: true` in Cloud Functions.
    appCheck({
      // The Firebase App Check service to use.
      // This identifier points to the App Check configuration in your
      // Firebase project.
      service:
        'projects/studio-9893157227-94cea/services/firebaseappcheck.googleapis.com',
    }),
  ],
});
