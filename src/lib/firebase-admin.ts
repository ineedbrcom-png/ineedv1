
import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

let adminApp: admin.App | null = null;
let firestoreAdmin: admin.firestore.Firestore | null = null;
let authAdmin: admin.auth.Auth | null = null;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();
    return;
  }

  try {
    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountB64) {
      console.warn('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida. O Firebase Admin SDK não será inicializado no servidor.');
      return;
    }
    
    const serviceAccountString = Buffer.from(serviceAccountB64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountString);

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firestoreAdmin = admin.firestore();
    authAdmin = admin.auth();

  } catch (error: any) {
    console.error('Falha na inicialização do Firebase Admin SDK:', error.message);
  }
}

initializeAdminApp();

export { firestoreAdmin, authAdmin, admin };
