import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_CATEGORIES } from '../utils/constants';

/*
 * מבנה הנתונים ב-Firestore:
 *   guests/{id}    vendors/{id}    tasks/{id}    tables/{id}
 *   settings/categories  →  { list: ['משפחה', 'חברים', ...] }
 *
 * כל פעולה מחזירה Promise. כשיש חיבור, ה-Promise מסתיים אחרי אישור מהשרת;
 * כשאין חיבור הוא נשאר פתוח עד שהחיבור חוזר (והמסך מתעדכן מיד מה-cache).
 */

// createdAt קובע את סדר ההצגה (Firestore לא שומר סדר הוספה)
export const addItem = (col, data) =>
  addDoc(collection(db, col), { ...data, createdAt: Date.now() });

export const updateItem = (col, id, patch) => updateDoc(doc(db, col, id), patch);

export const deleteItem = (col, id) => deleteDoc(doc(db, col, id));

// הוספת כמה פריטים בפעולה אחת (למשל כמה שולחנות ברצף, או משימות מוצעות)
export function addMany(col, list) {
  const batch = writeBatch(db);
  const base = Date.now();
  list.forEach((data, i) => {
    batch.set(doc(collection(db, col)), { ...data, createdAt: base + i });
  });
  return batch.commit();
}

// מחיקת שולחן + שחרור כל ההזמנות שהיו משובצות אליו, באותה פעולה אטומית
export function deleteTableAndUnseat(tableId, seatedGuestIds) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'tables', tableId));
  seatedGuestIds.forEach((guestId) => {
    batch.update(doc(db, 'guests', guestId), { tableId: null });
  });
  return batch.commit();
}

// arrayUnion מונע כפילויות וגם מונע דריסה אם שניכם מוסיפים קטגוריה באותו זמן
export const addCategoryName = (name) =>
  setDoc(
    doc(db, 'settings', 'categories'),
    { list: arrayUnion(...DEFAULT_CATEGORIES, name) },
    { merge: true }
  );
