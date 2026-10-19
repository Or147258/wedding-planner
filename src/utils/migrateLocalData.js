import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// ייבוא חד-פעמי של נתונים שנשמרו בגרסה הקודמת (localStorage) אל Firestore.
// המזהים נשמרים, כך שהשיבוץ לשולחנות נשאר תקין, ואין כפילויות אם מריצים פעמיים.

const COLLECTIONS = ['guests', 'vendors', 'tasks', 'tables'];

const read = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(`wedding-planner.${key}`));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const localDataSummary = () => Object.fromEntries(COLLECTIONS.map((c) => [c, read(c).length]));

export const hasLocalData = () => COLLECTIONS.some((c) => read(c).length > 0);

export async function importLocalData() {
  const base = Date.now();
  const ops = [];

  COLLECTIONS.forEach((col) => {
    read(col).forEach((item, i) => {
      const { id, ...data } = item;
      const ref = id ? doc(db, col, String(id)) : doc(collection(db, col));
      ops.push([ref, { createdAt: base + i, ...data }]);
    });
  });

  const categories = read('categories');
  if (categories.length) ops.push([doc(db, 'settings', 'categories'), { list: categories }]);

  // Firestore מגביל batch ל-500 פעולות
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    ops.slice(i, i + 400).forEach(([ref, data]) => batch.set(ref, data));
    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
  }
}
