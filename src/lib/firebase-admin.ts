
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
  
  // 2. Tentar inicialização automática do App Hosting
  // O App Hosting injeta a configuração via process.env.FIREBASE_CONFIG
  if (process.env.FIREBASE_CONFIG) {
    try {
      console.log("Inicializando Firebase Admin com configuração automática do App Hosting.");
      return admin.initializeApp();
    } catch (error) {
      console.error("Erro ao inicializar Firebase Admin com config automática:", error);
      // Se a automática falhar, tentamos a manual abaixo.
    }
  }

  // 3. Tentar inicialização manual com chave de serviço (para desenvolvimento local)
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error("ERRO CRÍTICO: Nenhuma configuração automática (FIREBASE_CONFIG) ou manual (FIREBASE_SERVICE_ACCOUNT_KEY) encontrada.");
    return null;
  }

  let serviceAccount: admin.ServiceAccount;
  try {
    // Tenta decodificar de Base64, que é o formato ideal.
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decodedKey);
  } catch (e) {
    console.warn("A decodificação Base64 da chave de serviço falhou. Tentando analisar o JSON diretamente. Para produção, use Base64.");
    try {
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
        console.error("ERRO CRÍTICO: Falha ao analisar FIREBASE_SERVICE_ACCOUNT_KEY. Verifique se a variável está correta e considere usar Base64.", error);
        return null;
    }
  }

  // Inicializa o app com as credenciais manuais
  try {
    console.log("Inicializando Firebase Admin com chave de serviço manual (local).");
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Erro ao inicializar o Firebase Admin App com chave manual:", error);
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
