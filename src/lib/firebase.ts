// Firebase Imports
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Singleton for the app instance
let appInstance: ReturnType<typeof initializeApp> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

function initializeFirebase() {
    if (appInstance) {
        return { app: appInstance, auth: authInstance!, db: dbInstance!, storage: storageInstance! };
    }

    // The configuration is read INSIDE the function to ensure environment variables are available.
    const firebaseConfig: FirebaseOptions = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // Robust validation to ensure keys are not missing
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Failed to initialize Firebase - missing API Key or Project ID in environment variables.");
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // App Check to protect against API abuse
    if (typeof window !== "undefined") {
        const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if(recaptchaSiteKey) {
            try {
                initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                    isTokenAutoRefreshEnabled: true,
                });
            } catch (e) {
                console.error("Failed to initialize App Check:", e);
            }
        } else {
            console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. App Check will not be initialized.");
        }
    }

    appInstance = app;
    authInstance = auth;
    dbInstance = db;
    storageInstance = storage;
    
    return { app, auth, db, storage };
}

// Exported function to get Firebase services
export function getFirebaseClient() {
    return initializeFirebase();
}
