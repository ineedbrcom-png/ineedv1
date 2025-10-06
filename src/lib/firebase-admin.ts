
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
    // Em ambientes de produção (como App Hosting), as credenciais são injetadas automaticamente.
    // Em desenvolvimento local com emuladores, o SDK também pode usar credenciais padrão se configurado.
    console.log("Inicializando Firebase Admin com as credenciais padrão do aplicativo.");
    return admin.initializeApp();
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
