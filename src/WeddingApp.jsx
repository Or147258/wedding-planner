import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/common/Navbar';
import Banner from './components/common/Banner';
import EmptyState from './components/common/EmptyState';
import MigrationBanner from './components/common/MigrationBanner';
import GuestsPage from './pages/GuestsPage';
import BudgetPage from './pages/BudgetPage';
import TasksPage from './pages/TasksPage';
import SeatingPage from './pages/SeatingPage';
import { useCategories, useCollection } from './hooks/useFirestore';
import {
  addCategoryName,
  addItem,
  addMany,
  deleteItem,
  deleteTableAndUnseat,
  updateItem,
} from './services/weddingApi';
import { describeFirebaseError } from './utils/firebaseErrors';
import { hasLocalData } from './utils/migrateLocalData';

const TABS = [
  { id: 'guests', label: 'מוזמנים' },
  { id: 'budget', label: 'תקציב וספקים' },
  { id: 'tasks', label: 'משימות' },
  { id: 'seating', label: 'סידורי הושבה' },
];

const readHash = () => {
  const hash = window.location.hash.replace('#', '');
  return TABS.some((t) => t.id === hash) ? hash : 'guests';
};

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export default function WeddingApp({ user }) {
  // ניווט בין הדפים לפי ה-hash בכתובת (#guests, #budget...)
  const [page, setPage] = useState(readHash);
  useEffect(() => {
    const onHashChange = () => setPage(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const online = useOnline();
  const [actionError, setActionError] = useState('');
  const [importDismissed, setImportDismissed] = useState(false);
  const [localDataFound] = useState(hasLocalData);

  /* ---------- האזנה בזמן אמת (onSnapshot) ---------- */
  const guestsQ = useCollection('guests');
  const vendorsQ = useCollection('vendors');
  const tasksQ = useCollection('tasks');
  const tablesQ = useCollection('tables');
  const categoriesQ = useCategories();

  const guests = guestsQ.items;
  const vendors = vendorsQ.items;
  const tasks = tasksQ.items;
  const tables = tablesQ.items;
  const categories = categoriesQ.items;

  const dataQueries = [guestsQ, vendorsQ, tasksQ, tablesQ];
  const allQueries = [...dataQueries, categoriesQ];
  const loading = allQueries.some((q) => q.loading);
  const listenError = allQueries.find((q) => q.error)?.error;

  // כל כתיבה ל-Firestore עוברת כאן: שגיאה מוצגת למשתמש במקום להיבלע
  const safe = (promise) => {
    promise.catch((err) => {
      console.error(err);
      setActionError(describeFirebaseError(err));
    });
  };

  /* ---------- מוזמנים ---------- */
  const addGuest = (values) => safe(addItem('guests', { ...values, tableId: null }));

  const updateGuest = (id, patch) => {
    // מי שלא אישר הגעה לא יושב בשולחן
    const next = patch.rsvp && patch.rsvp !== 'confirmed' ? { ...patch, tableId: null } : patch;
    safe(updateItem('guests', id, next));
  };

  const deleteGuest = (id) => safe(deleteItem('guests', id));

  // מחזיר את שם הקטגוריה (הקיימת, אם כבר יש כזו) כדי שהטופס יוכל לבחור בה מיד
  const addCategory = (name) => {
    const trimmed = name.trim();
    const existing = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    safe(addCategoryName(trimmed));
    return trimmed;
  };

  /* ---------- ספקים ---------- */
  const addVendor = (values) => safe(addItem('vendors', values));
  const updateVendor = (id, patch) => safe(updateItem('vendors', id, patch));
  const deleteVendor = (id) => safe(deleteItem('vendors', id));

  /* ---------- משימות ---------- */
  const addTasks = (items) =>
    safe(addMany('tasks', items.map((item) => ({ dueDate: '', ...item, done: false }))));
  const updateTask = (id, patch) => safe(updateItem('tasks', id, patch));
  const deleteTask = (id) => safe(deleteItem('tasks', id));

  /* ---------- שולחנות והושבה ---------- */
  const addTables = (list) => safe(addMany('tables', list));
  const updateTable = (id, patch) => safe(updateItem('tables', id, patch));
  const deleteTable = (id) => {
    const seatedIds = guests.filter((g) => g.tableId === id).map((g) => g.id);
    safe(deleteTableAndUnseat(id, seatedIds));
  };
  const assignGuest = (guestId, tableId) => updateGuest(guestId, { tableId });

  // מציעים ייבוא רק כשאומת מול השרת ש-Firestore ריק
  const offerImport =
    localDataFound &&
    !importDismissed &&
    dataQueries.every((q) => q.synced && q.items.length === 0);

  let content;
  if (listenError) {
    content = (
      <EmptyState title="לא הצלחנו לטעון את הנתונים" text={describeFirebaseError(listenError)} />
    );
  } else if (loading) {
    content = <p className="py-20 text-center text-sm text-stone-500">טוען נתונים…</p>;
  } else {
    content = (
      <>
        {page === 'guests' && (
          <GuestsPage
            guests={guests}
            categories={categories}
            onAdd={addGuest}
            onUpdate={updateGuest}
            onDelete={deleteGuest}
            onAddCategory={addCategory}
          />
        )}
        {page === 'budget' && (
          <BudgetPage vendors={vendors} onAdd={addVendor} onUpdate={updateVendor} onDelete={deleteVendor} />
        )}
        {page === 'tasks' && (
          <TasksPage tasks={tasks} onAdd={addTasks} onUpdate={updateTask} onDelete={deleteTask} />
        )}
        {page === 'seating' && (
          <SeatingPage
            guests={guests}
            tables={tables}
            onAddTables={addTables}
            onUpdateTable={updateTable}
            onDeleteTable={deleteTable}
            onAssign={assignGuest}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar tabs={TABS} active={page} userEmail={user?.email} onSignOut={() => signOut(auth)} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!online && (
          <Banner tone="amber">
            אין חיבור לאינטרנט. אפשר להמשיך לעבוד — השינויים יישמרו וייסונכרנו כשהחיבור יחזור.
          </Banner>
        )}
        {actionError && (
          <Banner tone="red" onClose={() => setActionError('')}>
            {actionError}
          </Banner>
        )}
        {offerImport && <MigrationBanner onDismiss={() => setImportDismissed(true)} />}
        {content}
      </main>
    </div>
  );
}
