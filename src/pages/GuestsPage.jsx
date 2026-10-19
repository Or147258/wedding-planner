import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { DownloadIcon, PlusIcon, SearchIcon } from '../components/common/Icons';
import GuestStats from '../components/guests/GuestStats';
import GuestForm from '../components/guests/GuestForm';
import GuestTable from '../components/guests/GuestTable';
import { RSVP, SIDES } from '../utils/constants';
import { computeGuestStats } from '../utils/guestStats';
import { exportSheets } from '../utils/exportExcel';
import { sumBy } from '../utils/helpers';

const GUEST_HEADER = ['שם המוזמן / משפחה', 'כמות מוזמנים', 'צד', 'קרבה', 'סטטוס אישור הגעה'];
const SUMMARY_HEADER = ['נושא', 'סה״כ מוזמנים', 'אישרו הגעה'];

export default function GuestsPage({ guests, categories, onAdd, onUpdate, onDelete, onAddCategory }) {
  const [modal, setModal] = useState({ open: false, guest: null });
  const [query, setQuery] = useState('');
  const [sideFilter, setSideFilter] = useState('all');
  const [rsvpFilter, setRsvpFilter] = useState('all');

  const stats = computeGuestStats(guests, categories);

  const q = query.trim();
  const filtered = guests.filter(
    (g) =>
      (sideFilter === 'all' || g.side === sideFilter) &&
      (rsvpFilter === 'all' || g.rsvp === rsvpFilter) &&
      (!q || g.name.includes(q))
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

  const handleExport = () => {
    const rows = guests.map((g) => ({
      'שם המוזמן / משפחה': g.name,
      'כמות מוזמנים': g.count,
      צד: SIDES[g.side]?.label ?? '',
      קרבה: g.category,
      'סטטוס אישור הגעה': RSVP[g.rsvp]?.label ?? '',
    }));

    const summary = [
      { נושא: 'סך הכל', 'סה״כ מוזמנים': stats.total, 'אישרו הגעה': stats.confirmed },
      ...stats.bySide.map((s) => ({
        נושא: `צד: ${s.label}`,
        'סה״כ מוזמנים': s.total,
        'אישרו הגעה': s.confirmed,
      })),
      ...stats.byCategory.map((c) => ({
        נושא: `קרבה: ${c.name}`,
        'סה״כ מוזמנים': c.total,
        'אישרו הגעה': c.confirmed,
      })),
    ];

    exportSheets('רשימת_מוזמנים.xlsx', [
      { name: 'מוזמנים', rows, header: GUEST_HEADER, widths: [28, 14, 14, 14, 18] },
      { name: 'סיכום', rows: summary, header: SUMMARY_HEADER, widths: [28, 16, 14] },
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
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <SearchIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                className="input ps-10"
                placeholder="חיפוש לפי שם…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="חיפוש מוזמן"
              />
            </div>
            <select
              className="input w-auto"
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              aria-label="סינון לפי צד"
            >
              <option value="all">כל הצדדים</option>
              {Object.entries(SIDES).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
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
