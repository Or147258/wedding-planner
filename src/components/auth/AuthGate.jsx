import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const ERRORS = {
  'auth/invalid-credential': 'אימייל או סיסמה שגויים',
  'auth/invalid-email': 'כתובת האימייל אינה תקינה',
  'auth/user-disabled': 'המשתמש הזה הושבת',
  'auth/too-many-requests': 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות',
  'auth/network-request-failed': 'אין חיבור לאינטרנט',
};

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(ERRORS[err.code] ?? 'ההתחברות נכשלה. נסו שוב');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-tight">
            אור <span className="text-rose-500">♥</span> עדן
          </p>
          <p className="mt-1 text-sm text-stone-500">התחברו כדי לראות את תכנון החתונה</p>
        </div>

        <div>
          <label className="label" htmlFor="login-email">
            אימייל
          </label>
          <input
            id="login-email"
            type="email"
            dir="ltr"
            autoComplete="username"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="login-password">
            סיסמה
          </label>
          <input
            id="login-password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'מתחבר…' : 'התחברות'}
        </button>
      </form>
    </div>
  );
}

// מציג את האפליקציה רק למשתמש מחובר. children היא פונקציה שמקבלת את המשתמש.
export default function AuthGate({ children }) {
  const [user, setUser] = useState(undefined); // undefined = עדיין בודקים

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) {
    return <p className="p-10 text-center text-sm text-stone-500">טוען…</p>;
  }
  return user ? children(user) : <LoginForm />;
}
