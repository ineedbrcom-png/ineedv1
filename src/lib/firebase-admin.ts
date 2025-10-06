
import * as admin from 'firebase-admin';

// Função para garantir que o App Admin seja inicializado apenas uma vez.
function initializeAdminApp() {
  // Evita reinicializações em ambientes de hot-reload (desenvolvimento)
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // 1. Segurança: Garantir que estamos no servidor
  if (typeof window !== 'undefined') {
    console.error("Firebase Admin SDK não pode ser inicializado no cliente.");
    return null;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.");
    }
      
    const credential = admin.credential.cert(JSON.parse(serviceAccountKey));

    console.log("Inicializando Firebase Admin com credenciais da conta de serviço.");
    return admin.initializeApp({ credential });

  } catch (error) {
    console.error("ERRO CRÍTICO: Falha ao inicializar o Firebase Admin. Verifique as credenciais do ambiente.", error);
    return null;
  }
}

// Uma instância única do app admin para todo o servidor.
const adminApp = initializeAdminApp();

/**
 * Retorna a instância do app Admin do Firebase inicializado.
 * Retorna null se a inicialização falhar.
 */
export function getAdminApp(): admin.app.App | null {
    return adminApp;
}

/**
 * Retorna uma instância do Firestore Admin.
 * Retorna null se o app não puder ser inicializado.
 */
export function getAdminFirestore() {
  const app = getAdminApp();
  if (!app) {
    console.error("Firestore Admin não pode ser obtido porque o App Admin falhou ao inicializar.");
    return null;
  }
  return admin.firestore(app);
}
