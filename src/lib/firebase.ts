
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCsnjI2bO4OorGwsGgBSsjW4rY_pLmuKB8",
  authDomain: "studio-9893157227-94cea.firebaseapp.com",
  databaseURL: "https://studio-9893157227-94cea-default-rtdb.firebaseio.com",
  projectId: "studio-9893157227-94cea",
  storageBucket: "studio-9893157227-94cea.appspot.com",
  messagingSenderId: "781597570567",
  appId: "1:781597570567:web:9630fd70fa061aa57a5ca2"
};


// This function is the single source of truth for Firebase client services
function getFirebaseClient() {
  let app: FirebaseApp;

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);

    if (typeof window !== 'undefined') {
      // The key is now exposed via next.config.js
      const appCheckKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (appCheckKey) {
        try {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(appCheckKey),
            isTokenAutoRefreshEnabled: true
          });
        } catch (e) {
          console.error("Error initializing App Check", e);
        }
      } else {
        console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. App Check will not be initialized.");
      }
    }
  } else {
    app = getApp();
  }
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  
  return { app, auth, db, storage };
}

// Export the function to be used in client components
export { getFirebaseClient };
