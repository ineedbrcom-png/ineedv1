import admin from 'firebase-admin';

// Esta verificação impede a reinicialização do app em ambientes de desenvolvimento (hot-reloading)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );

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
