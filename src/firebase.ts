import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCAc6BBPQFO05PMnK64ziubKufIZbVg5kg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "correa-c1038.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "correa-c1038",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "correa-c1038.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "667732067893",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:667732067893:web:398ffb68844382eeaad37c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DTSQB9YKPP",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const analytics = getAnalytics(app)
export const db = getFirestore(app)

export default app
