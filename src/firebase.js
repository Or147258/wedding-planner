import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

/* ------------------------------------------------------------------ *
 *  כאן מדביקים את המפתחות מ-Firebase Console:
 *  Project settings ⚙ → General → Your apps → Web app → SDK setup and configuration
 * ------------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// כל עוד המפתחות ריקים האפליקציה מציגה מסך הסבר במקום להתרסק
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // initializeApp נקראת פעם אחת בלבד, כאן ורק כאן
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    // מטמון מקומי: ממשיכים לעבוד גם בלי קליטה, והשינויים מסתנכרנים כשהחיבור חוזר
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

export { auth, db };
