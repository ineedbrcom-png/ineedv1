
import * as admin from 'firebase-admin';

// Função auxiliar para analisar a chave privada do ambiente
function getServiceAccount(): admin.ServiceAccount | null {
  // 1. Segurança: Garantir que estamos no servidor
  if (typeof window !== 'undefined') {
    return null;
  }

  // 2. Ler a variável de ambiente (SEM o prefixo NEXT_PUBLIC_)
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error("ERRO CRÍTICO: FIREBASE_SERVICE_ACCOUNT_KEY não está definida no ambiente do servidor.");
    return null;
  }

  try {
    // 3. Tenta analisar o JSON da variável de ambiente
    // Se isso falhar em produção devido a múltiplas linhas, a solução será codificar a chave em Base64.
    return JSON.parse(serviceAccountKey) as admin.ServiceAccount;
  } catch (error) {
    console.error("ERRO CRÍTICO: Falha ao analisar FIREBASE_SERVICE_ACCOUNT_KEY. Verifique se o JSON é válido.", error);
    return null;
  }
}

export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    // Já inicializado (evita erros em Hot Reload do Next.js)
    return admin.app();
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    // Não conseguiu carregar as credenciais, a inicialização falha.
    return null;
  }

  // Inicializa o app Admin
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Função auxiliar para obter a instância do Admin Firestore
export function getAdminFirestore() {
  const app = initializeFirebaseAdmin();
  if (!app) {
    // Este é o ponto que gera o seu erro atual!
    console.error("Firestore Admin não inicializado."); // Mensagem de erro vista no console
    return null;
  }
  return admin.firestore(app);
}
