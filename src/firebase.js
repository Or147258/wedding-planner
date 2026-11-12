import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

/* ------------------------------------------------------------------ *
 *  מפתחות Firebase — Project settings ⚙ → General → Your apps → Web app.
 *
 *  שתי דרכים (מספיקה אחת):
 *   1. להדביק כאן בין הגרשיים, במקום ה-''.
 *   2. להגדיר משתני סביבה VITE_FIREBASE_* (בקובץ .env מקומי, או ב-Vercel
 *      תחת Settings → Environment Variables). ראו .env.example.
 *
 *  המפתחות אינם סוד — ההגנה האמיתית היא חוקי האבטחה (firestore.rules).
 * ------------------------------------------------------------------ */
const env = import.meta.env;

const firebaseConfig = {
  apiKey: 'AIzaSyDzQBAWWOcrJVkDFduecBv0j8gj4c4Ks0Q',
  authDomain: 'wedding-planner-110dd.firebaseapp.com',
  projectId: 'wedding-planner-110dd',
  storageBucket: 'wedding-planner-110dd.firebasestorage.app',
  messagingSenderId: '670936078654',
  appId: '1:670936078654:web:26d374bf304a4ebf5d746f',
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
    // מטמון מקומי: ממשיכים לעבוד גם בלי קליטה (למשל באולם), והשינויים מסתנכרנים כשהחיבור חוזר
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    // שדה undefined מתעלמים ממנו במקום לזרוק שגיאה
    ignoreUndefinedProperties: true,
  });
}

export { auth, db };
