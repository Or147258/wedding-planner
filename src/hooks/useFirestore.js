import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_CATEGORIES } from '../utils/constants';

const byCreated = (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0) || a.id.localeCompare(b.id);

/**
 * מאזין בזמן אמת (onSnapshot) לאוסף שלם — כל שינוי, שלי או של הצד השני, מעדכן את ה-state מיד.
 *
 * מחזיר:
 *   items   – המסמכים (עם id), ממוינים לפי זמן יצירה
 *   loading – true עד שהגיע הנתון הראשון (מהשרת או מה-cache המקומי)
 *   error   – שגיאת האזנה (למשל permission-denied)
 *   synced  – true רק אחרי שהנתונים אומתו מול השרת (לא רק מה-cache)
 */
export function useCollection(name) {
  const [state, setState] = useState({ items: [], loading: true, error: null, synced: false });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, name),
      { includeMetadataChanges: true }, // כדי לדעת מתי עברנו מ-cache לנתוני שרת
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byCreated);
        setState({ items, loading: false, error: null, synced: !snap.metadata.fromCache });
      },
      (error) => setState((s) => ({ ...s, loading: false, error }))
    );
    return unsubscribe; // ניקוי ההאזנה כשהקומפוננטה יורדת מהמסך
  }, [name]);

  return state;
}

/** רשימת הקטגוריות המשותפת (settings/categories). עד שנוספה קטגוריה — ברירות המחדל. */
export function useCategories() {
  const [state, setState] = useState({ items: DEFAULT_CATEGORIES, loading: true, error: null });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'categories'),
      (snap) => {
        const list = snap.exists() ? snap.data().list : null;
        setState({
          items: Array.isArray(list) && list.length ? list : DEFAULT_CATEGORIES,
          loading: false,
          error: null,
        });
      },
      (error) => setState((s) => ({ ...s, loading: false, error }))
    );
    return unsubscribe;
  }, []);

  return state;
}
