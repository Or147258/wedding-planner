import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDzQBAWWOcrJVkDFduecBv0j8gj4c4Ks0Q",
  authDomain: "wedding-planner-110dd.firebaseapp.com",
  projectId: "wedding-planner-110dd",
  storageBucket: "wedding-planner-110dd.firebasestorage.app",
  messagingSenderId: "670936078654",
  appId: "1:670936078654:web:26d374bf304a4ebf5d746f"
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let auth = null;
let db = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
}

export { auth, db };