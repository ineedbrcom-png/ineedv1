
import * as admin from 'firebase-admin';

// Função para garantir que o App Admin seja inicializado apenas uma vez.
function initializeAdminApp() {
  // Evita reinicializações em ambientes de hot-reload (desenvolvimento)
  if (admin.apps.length > 0) {
    return admin.app();
  }

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

  let serviceAccount: admin.ServiceAccount;
  try {
    // Tenta decodificar de Base64, que é o formato ideal para produção.
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decodedKey);
  } catch (e) {
    console.warn("A decodificação Base64 da chave de serviço falhou. Tentando analisar o JSON diretamente. Para produção, use Base64.");
    try {
        // Se falhar, tenta analisar como JSON direto (útil para desenvolvimento local).
        serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
        console.error("ERRO CRÍTICO: Falha ao analisar FIREBASE_SERVICE_ACCOUNT_KEY. Verifique se a variável está correta e considere usar Base64.", error);
        return null;
    }
  }

  // Inicializa o app com as credenciais
  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Erro ao inicializar o Firebase Admin App:", error);
    return null;
  }
}

// Inicializa o app no momento em que o módulo é carregado.
initializeAdminApp();

/**
 * Retorna a instância do app Admin do Firebase inicializado.
 * Retorna null se a inicialização falhar.
 */
export function getAdminApp(): admin.app.App | null {
    if (admin.apps.length === 0) {
        return initializeAdminApp();
    }
    return admin.app();
}


/**
 * Retorna uma instância do Firestore Admin.
 * Retorna null se o app não puder ser inicializado.
 */
export function getAdminFirestore() {
  const app = getAdminApp();
  if (!app) {
    console.error("Firestore Admin não inicializado porque o App Admin falhou ao inicializar.");
    return null;
  }
  return admin.firestore(app);
}
