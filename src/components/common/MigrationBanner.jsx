import { useState } from 'react';
import Banner from './Banner';
import { importLocalData, localDataSummary } from '../../utils/migrateLocalData';
import { describeFirebaseError } from '../../utils/firebaseErrors';

// מוצג (מ-WeddingApp) רק כשיש נתונים ב-localStorage ו-Firestore ריק לפי אישור השרת.
// אחרי הייבוא ה-onSnapshot ממלא את המסך, ולכן הבאנר נעלם מעצמו.
export default function MigrationBanner({ onDismiss }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const s = localDataSummary();

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      await importLocalData();
    } catch (err) {
      console.error(err);
      setError(describeFirebaseError(err));
      setBusy(false);
    }
  };

  return (
    <Banner tone="sky">
      <p className="font-medium">נמצאו נתונים שהוזנו בדפדפן הזה לפני המעבר ל-Firebase.</p>
      <p className="mt-1">
        {s.guests} הזמנות, {s.vendors} ספקים, {s.tasks} משימות ו-{s.tables} שולחנות. לייבא אותם לענן, כדי
        שגם עדן תראה אותם? כדאי לעשות זאת פעם אחת בלבד, מהמכשיר שבו הוזנו הנתונים.
      </p>
      {error && <p className="mt-1 text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-primary" onClick={run} disabled={busy}>
          {busy ? 'מייבא…' : 'ייבוא ל-Firebase'}
        </button>
        <button type="button" className="btn-secondary" onClick={onDismiss} disabled={busy}>
          לא עכשיו
        </button>
      </div>
    </Banner>
  );
}
