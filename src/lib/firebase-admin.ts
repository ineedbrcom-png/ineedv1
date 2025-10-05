
import * as admin from 'firebase-admin';

// Função auxiliar para analisar a chave privada do ambiente
function getServiceAccount(): admin.ServiceAccount | null {
  // 1. Segurança: Garantir que estamos no servidor
  if (typeof window !== 'undefined') {
    return null;
  }

  // 2. Ler a variável de ambiente
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error("ERRO CRÍTICO: FIREBASE_SERVICE_ACCOUNT_KEY não está definida no ambiente do servidor.");
    return null;
  }

  try {
    // NOVO: Tenta decodificar de Base64 primeiro. Isso é mais robusto para produção.
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    return JSON.parse(decodedKey) as admin.ServiceAccount;
  } catch (e) {
    // Se a decodificação Base64 falhar, tenta analisar o JSON diretamente (para desenvolvimento).
    console.warn("A decodificação Base64 da chave de serviço falhou. Tentando analisar o JSON diretamente. Para produção, use Base64.");
    try {
        return JSON.parse(serviceAccountKey) as admin.ServiceAccount;
    } catch (error) {
        console.error("ERRO CRÍTICO: Falha ao analisar FIREBASE_SERVICE_ACCOUNT_KEY como JSON direto. Verifique se a variável está correta e considere usar Base64.", error);
        return null;
    }
  }
}

// O restante do arquivo permanece o mesmo...

export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function getAdminFirestore() {
  const app = initializeFirebaseAdmin();
  if (!app) {
    console.error("Firestore Admin não inicializado.");
    return null;
  }
  return admin.firestore(app);
}
