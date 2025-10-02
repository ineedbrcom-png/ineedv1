import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

// Esta verificação impede a reinicialização do app em ambientes de desenvolvimento (hot-reloading)
if (!admin.apps.length) {
  try {
    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountB64) {
      throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
    }
    
    // Decodifica a string Base64 para uma string JSON
    const serviceAccountString = Buffer.from(serviceAccountB64, 'base64').toString('utf8');

    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Adicione a URL do seu banco de dados se estiver usando Realtime Database
      // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
     console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('Firebase Admin initialization error', error.stack);
  }
}

const firestoreAdmin = admin.firestore();
const authAdmin = admin.auth();

export { firestoreAdmin, authAdmin, admin };
