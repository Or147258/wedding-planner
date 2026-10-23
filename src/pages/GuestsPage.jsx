import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { DownloadIcon, PlusIcon, SearchIcon } from '../components/common/Icons';
import Countdown from '../components/guests/Countdown';
import GuestStats from '../components/guests/GuestStats';
import GuestForm from '../components/guests/GuestForm';
import GuestTable from '../components/guests/GuestTable';
import { MEALS, RSVP, SIDES } from '../utils/constants';
import { computeGuestStats, mealsOf } from '../utils/guestStats';
import { exportSheets } from '../utils/exportExcel';
import { sumBy } from '../utils/helpers';

// כפתורי הסינון המהיר: "הכל" + ארבעת הצדדים
const SIDE_FILTERS = [
  { id: 'all', label: 'הכל' },
  ...Object.entries(SIDES).map(([id, s]) => ({ id, label: s.label })),
];

const GUEST_HEADER = [
  'שם',
  'מספר פלאפון',
  'כמות מוזמנים',
  'סטטוס אישור הגעה',
  'קרבה',
  'צד',
  'מנות רגילות',
  ...Object.values(MEALS).map((m) => m.label),
];
const SUMMARY_HEADER = ['נושא', 'סה״כ', 'אישרו הגעה'];

export default function GuestsPage({
  guests,
  categories,
  wedding,
  onSetWedding,
  onAdd,
  onUpdate,
  onDelete,
  onAddCategory,
}) {
  const [modal, setModal] = useState({ open: false, guest: null });
  const [query, setQuery] = useState('');
  const [sideFilter, setSideFilter] = useState('all');
  const [rsvpFilter, setRsvpFilter] = useState('all');

  const stats = computeGuestStats(guests, categories);

  const q = query.trim();
  const qDigits = q.replace(/\D/g, '');
  const matchesQuery = (g) =>
    !q ||
    g.name.includes(q) ||
    (qDigits.length > 0 && (g.phone ?? '').replace(/\D/g, '').includes(qDigits));

  const filtered = guests.filter(
    (g) =>
      (sideFilter === 'all' || g.side === sideFilter) &&
      (rsvpFilter === 'all' || g.rsvp === rsvpFilter) &&
      matchesQuery(g)
  );

  const closeModal = () => setModal({ open: false, guest: null });

  const handleSubmit = (values) => {
    if (modal.guest) onUpdate(modal.guest.id, values);
    else onAdd(values);
    closeModal();
  };

  const handleDelete = (guest) => {
    if (window.confirm(`למחוק את "${guest.name}" מרשימת המוזמנים?`)) onDelete(guest.id);
  };

  // הייצוא כולל את כל הרשימה (לא רק את מה שמסונן כרגע)
  const handleExport = () => {
    const rows = guests.map((g) => {
      const m = mealsOf(g);
      return {
        שם: g.name,
        'מספר פלאפון': g.phone || '',
        'כמות מוזמנים': g.count,
        'סטטוס אישור הגעה': RSVP[g.rsvp]?.label ?? '',
        קרבה: g.category,
        צד: SIDES[g.side]?.label ?? '',
        'מנות רגילות': m.regular,
        ...Object.fromEntries(Object.entries(MEALS).map(([k, meal]) => [meal.label, m[k]])),
      };
    });

    const summary = [
      { נושא: 'סך הכל', 'סה״כ': stats.total, 'אישרו הגעה': stats.confirmed },
      ...stats.bySide.map((s) => ({ נושא: `צד: ${s.label}`, 'סה״כ': s.total, 'אישרו הגעה': s.confirmed })),
      ...stats.byCategory.map((c) => ({ נושא: `קרבה: ${c.name}`, 'סה״כ': c.total, 'אישרו הגעה': c.confirmed })),
      ...stats.meals.map((m) => ({ נושא: `מנות: ${m.label}`, 'סה״כ': m.total, 'אישרו הגעה': m.confirmed })),
    ];

    exportSheets('רשימת_מוזמנים.xlsx', [
      { name: 'מוזמנים', rows, header: GUEST_HEADER, widths: [26, 16, 14, 18, 12, 16, 12, 10, 10, 12, 12] },
      { name: 'סיכום', rows: summary, header: SUMMARY_HEADER, widths: [30, 12, 14] },
    ]);
  };

  return (
    <>
      <PageHeader title="ניהול מוזמנים" subtitle="הוספה, עריכה ומעקב אחרי אישורי הגעה">
        <button type="button" className="btn-export" onClick={handleExport} disabled={!guests.length}>
          <DownloadIcon />
          ייצוא לאקסל
        </button>
        <button type="button" className="btn-primary" onClick={() => setModal({ open: true, guest: null })}>
          <PlusIcon />
          הוספת מוזמן
        </button>
      </PageHeader>

      <Countdown date={wedding.date} time={wedding.time} onSave={onSetWedding} />

      <GuestStats stats={stats} />

      {guests.length === 0 ? (
        <EmptyState
          title="עדיין אין מוזמנים ברשימה"
          text="הוסיפו את ההזמנה הראשונה — משפחה או אדם בודד — והדשבורד יתעדכן אוטומטית."
        >
          <button type="button" className="btn-primary" onClick={() => setModal({ open: true, guest: null })}>
            <PlusIcon />
            הוספת מוזמן
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="סינון מהיר לפי צד">
            {SIDE_FILTERS.map((f) => {
              const active = sideFilter === f.id;
              const count = sumBy(
                guests.filter((g) => f.id === 'all' || g.side === f.id),
                (g) => g.count
              );
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSideFilter(f.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-stone-800 text-white'
                      : 'bg-white text-stone-600 ring-1 ring-inset ring-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f.label}
                  <span className={`ms-1.5 tabular-nums ${active ? 'text-stone-300' : 'text-stone-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <SearchIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                className="input ps-10"
                placeholder="חיפוש לפי שם או טלפון…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="חיפוש מוזמן"
              />
            </div>
            <select
              className="input w-auto"
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              aria-label="סינון לפי סטטוס הגעה"
            >
              <option value="all">כל הסטטוסים</option>
              {Object.entries(RSVP).map(([key, r]) => (
                <option key={key} value={key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="לא נמצאו תוצאות" text="נסו לשנות את החיפוש או את הסינון." />
          ) : (
            <>
              <GuestTable
                guests={filtered}
                onEdit={(guest) => setModal({ open: true, guest })}
                onDelete={handleDelete}
                onRsvpChange={(id, rsvp) => onUpdate(id, { rsvp })}
              />
              <p className="mt-3 text-sm text-stone-500">
                מוצגות {filtered.length} הזמנות · {sumBy(filtered, (g) => g.count)} מוזמנים
              </p>
            </>
          )}
        </>
      )}

      <Modal
        open={modal.open}
        title={modal.guest ? 'עריכת מוזמן' : 'הוספת מוזמן'}
        onClose={closeModal}
      >
        <GuestForm
          initial={modal.guest}
          categories={categories}
          onAddCategory={onAddCategory}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
