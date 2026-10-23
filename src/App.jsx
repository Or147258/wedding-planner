import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import Login from './components/Login';
import Guests from './components/Guests';

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card max-w-lg p-8">
        <h1 className="text-xl font-semibold">צריך לחבר את Firebase</h1>
        <p className="mt-2 text-sm text-stone-600">הקוד מוכן, אבל מפתחות החיבור עדיין ריקים.</p>
        <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm text-stone-700">
          <li>ב-Firebase Console צרו פרויקט, הוסיפו Web app והפעילו Firestore Database.</li>
          <li>
            ב-Authentication הפעילו Email/Password וצרו משתמש לכל אחד מכם.
          </li>
          <li>
            הדביקו את <code dir="ltr">firebaseConfig</code> בקובץ <code dir="ltr">src/firebase.js</code>.
          </li>
          <li>
            הדביקו את <code dir="ltr">firestore.rules</code> ב-Firestore ← Rules (עם כתובות המייל שלכם).
          </li>
        </ol>
      </div>
    </div>
  );
}

function AuthedApp() {
  const [user, setUser] = useState(undefined); // undefined = עדיין בודקים
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <p className="p-10 text-center text-sm text-stone-500">טוען…</p>;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="text-lg font-semibold tracking-tight">
            אור <span className="text-rose-500">♥</span> עדן
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span dir="ltr" className="hidden sm:inline">
              {user.email}
            </span>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => signOut(auth)}>
              יציאה
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Guests />
      </main>
    </div>
  );
}

export default function App() {
  return isFirebaseConfigured ? <AuthedApp /> : <SetupNotice />;
}
