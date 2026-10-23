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
 *  (המפתחות אינם סוד — ההגנה האמיתית היא חוקי האבטחה ב-firestore.rules)
 * ------------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// כל עוד המפתחות ריקים האפליקציה מציגה מסך הסבר (SetupNotice) במקום להתרסק
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    // מטמון מקומי: האפליקציה ממשיכה לעבוד גם בלי קליטה (למשל באולם)
    // ומסתנכרנת אוטומטית כשהחיבור חוזר. עובד גם בכמה לשוניות במקביל.
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    // שדה undefined מתעלמים ממנו במקום לזרוק שגיאה
    ignoreUndefinedProperties: true,
  });
}

export { app, auth, db };
