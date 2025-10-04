import admin from 'firebase-admin';
import type { app } from 'firebase-admin';

let adminApp: app.App | null = null;
let firestoreAdmin: admin.firestore.Firestore | null = null;
let authAdmin: admin.auth.Auth | null = null;

export function initializeAdminApp() {
  if (adminApp) {
    return;
  }

  if (admin.apps.length > 0) {
    adminApp = admin.app();
  } else {
    try {
      const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountJSON) {
        console.warn('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida. O Firebase Admin SDK não será inicializado no servidor.');
        return;
      }
      
      const serviceAccount = JSON.parse(serviceAccountJSON);

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'studio-9893157227-94cea.appspot.com',
      });

    } catch (error: any) {
      console.error('Falha na inicialização do Firebase Admin SDK:', error.message);
      adminApp = null;
    }
  }
  
  if (adminApp) {
    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
  }
}

// Esta função é a que o middleware (ou outras partes do app) vai usar
export function getAdminApp() {
  if (!adminApp) {
    initializeAdminApp();
  }
  return adminApp;
}

// Inicializa na primeira importação
initializeAdminApp();

export { firestoreAdmin, authAdmin, admin };