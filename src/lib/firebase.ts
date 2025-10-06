
// Importações do Firebase
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Singleton para a instância do app
let appInstance: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

function initializeFirebase() {
    if (appInstance) {
        return { app: appInstance, auth: authInstance!, db: dbInstance!, storage: storageInstance! };
    }

    // A configuração é lida DENTRO da função para garantir que as variáveis de ambiente estejam disponíveis.
    const firebaseConfig: FirebaseOptions = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // Validação robusta para garantir que as chaves não estão faltando
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Failed to initialize Firebase - missing API Key or Project ID in environment variables.");
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // App Check para proteger contra abuso de API
    if (typeof window !== "undefined") {
        const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if(recaptchaSiteKey) {
            try {
                initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                    isTokenAutoRefreshEnabled: true,
                });
            } catch (e) {
                console.error("Falha ao inicializar o App Check:", e);
            }
        } else {
            console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY não definida. App Check não será inicializado.");
        }
    }

    appInstance = app;
    authInstance = auth;
    dbInstance = db;
    storageInstance = storage;
    
    return { app, auth, db, storage };
}

// Função exportada para obter os serviços do Firebase
export function getFirebaseClient() {
    return initializeFirebase();
}
