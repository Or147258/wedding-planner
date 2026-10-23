// מסך שמוצג כשעדיין לא הוזנו מפתחות Firebase בקובץ src/firebase.js
export default function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card max-w-lg p-8">
        <h1 className="text-xl font-semibold">צריך לחבר את Firebase</h1>
        <p className="mt-2 text-sm text-stone-600">
          האפליקציה כבר עובדת מול Firestore, אבל עדיין לא הוזנו פרטי הפרויקט.
        </p>
        <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm text-stone-700">
          <li>
            ב-Firebase Console צרו פרויקט והוסיפו אליו Web app (סמל <code dir="ltr">&lt;/&gt;</code>).
          </li>
          <li>
            הפעילו Firestore Database (<span dir="ltr">Build → Firestore Database → Create database</span>).
          </li>
          <li>
            העתיקו את אובייקט ה-<code dir="ltr">firebaseConfig</code> לקובץ{' '}
            <code dir="ltr">src/firebase.js</code> (הוא כרגע ריק), או הגדירו אותם כמשתני סביבה{' '}
            <code dir="ltr">VITE_FIREBASE_*</code> (ראו <code dir="ltr">.env.example</code>).
          </li>
          <li>
            הפעילו <span dir="ltr">Authentication → Email/Password</span> וצרו משתמש לכל אחד מכם (ואז הדביקו
            את <code dir="ltr">firestore.rules</code> ב-Rules).
          </li>
          <li>שמרו את הקובץ — הדף יתרענן לבד.</li>
        </ol>
      </div>
    </div>
  );
}
