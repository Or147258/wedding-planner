import { useEffect, useState } from 'react';
import Navbar from './components/common/Navbar';
import GuestsPage from './pages/GuestsPage';
import BudgetPage from './pages/BudgetPage';
import TasksPage from './pages/TasksPage';
import SeatingPage from './pages/SeatingPage';
import useLocalStorage from './hooks/useLocalStorage';
import { DEFAULT_CATEGORIES } from './utils/constants';
import { uid } from './utils/helpers';

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

export default function App() {
  // ניווט בין הדפים לפי ה-hash בכתובת (#guests, #budget...)
  const [page, setPage] = useState(readHash);
  useEffect(() => {
    const onHashChange = () => setPage(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // כל הנתונים נשמרים ב-localStorage של הדפדפן
  const [guests, setGuests] = useLocalStorage('guests', []);
  const [categories, setCategories] = useLocalStorage('categories', DEFAULT_CATEGORIES);
  const [vendors, setVendors] = useLocalStorage('vendors', []);
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [tables, setTables] = useLocalStorage('tables', []);

  /* ---------- מוזמנים ---------- */
  const addGuest = (values) => setGuests((prev) => [...prev, { ...values, id: uid(), tableId: null }]);

  const updateGuest = (id, patch) =>
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const next = { ...g, ...patch };
        // מי שלא אישר הגעה לא יושב בשולחן
        if (next.rsvp !== 'confirmed') next.tableId = null;
        return next;
      })
    );

  const deleteGuest = (id) => setGuests((prev) => prev.filter((g) => g.id !== id));

  // מחזיר את שם הקטגוריה (הקיימת, אם כבר יש כזו) כדי שהטופס יוכל לבחור בה
  const addCategory = (name) => {
    const trimmed = name.trim();
    const existing = categories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    setCategories((prev) => [...prev, trimmed]);
    return trimmed;
  };

  /* ---------- ספקים ---------- */
  const addVendor = (values) => setVendors((prev) => [...prev, { ...values, id: uid() }]);
  const updateVendor = (id, patch) =>
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const deleteVendor = (id) => setVendors((prev) => prev.filter((v) => v.id !== id));

  /* ---------- משימות ---------- */
  const addTasks = (items) =>
    setTasks((prev) => [
      ...prev,
      ...items.map((item, i) => ({
        dueDate: '',
        ...item,
        id: uid(),
        done: false,
        createdAt: Date.now() + i,
      })),
    ]);
  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  /* ---------- שולחנות והושבה ---------- */
  const addTables = (list) =>
    setTables((prev) => [...prev, ...list.map((t) => ({ ...t, id: uid() }))]);
  const updateTable = (id, patch) =>
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const deleteTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    setGuests((prev) => prev.map((g) => (g.tableId === id ? { ...g, tableId: null } : g)));
  };
  const assignGuest = (guestId, tableId) => updateGuest(guestId, { tableId });

  return (
    <div className="min-h-screen">
      <Navbar tabs={TABS} active={page} />
      <main className="mx-auto max-w-6xl px-4 py-8">
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
      </main>
    </div>
  );
}
