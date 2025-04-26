import { initializeApp } from 'firebase/app';
import { getAuth, browserPopupRedirectResolver } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG;

// Initialize Firebase
export const app = initializeApp(JSON.parse(firebaseConfig));

// Get Firebase Auth instance
export const auth = getAuth(app);

export { browserPopupRedirectResolver };
