import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';
import { DownloadIcon, PlusIcon } from '../components/common/Icons';
import TableForm from '../components/seating/TableForm';
import TableCard from '../components/seating/TableCard';
import UnassignedList from '../components/seating/UnassignedList';
import { SIDES } from '../utils/constants';
import { byHebrewName, sumBy } from '../utils/helpers';
import { exportSheets } from '../utils/exportExcel';

export default function SeatingPage({
  guests,
  tables,
  onAddTables,
  onUpdateTable,
  onDeleteTable,
  onAssign,
}) {
  const [modal, setModal] = useState({ open: false, table: null });
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  const sortedTables = [...tables].sort((a, b) => a.number - b.number);
  const tableIds = new Set(tables.map((t) => t.id));

  const confirmed = guests.filter((g) => g.rsvp === 'confirmed');
  const isSeated = (g) => Boolean(g.tableId) && tableIds.has(g.tableId);
  const unassigned = confirmed.filter((g) => !isSeated(g)).sort(byHebrewName);

  const guestsAt = (tableId) => confirmed.filter((g) => g.tableId === tableId).sort(byHebrewName);
  const occupiedOf = (tableId) => sumBy(guestsAt(tableId), (g) => g.count);

  const totalSeats = sumBy(tables, (t) => t.capacity);
  const freeSeats = sumBy(tables, (t) => Math.max(0, t.capacity - occupiedOf(t.id)));
  const seatedPeople = sumBy(
    confirmed.filter(isSeated),
    (g) => g.count
  );
  const waitingPeople = sumBy(unassigned, (g) => g.count);

  const tryAssign = (guestId, tableId) => {
    const guest = guests.find((g) => g.id === guestId);
    const table = tables.find((t) => t.id === tableId);
    if (!guest || !table || guest.tableId === tableId) return;

    const free = table.capacity - occupiedOf(table.id);
    if (guest.count > free) {
      setNotice(
        `אין מספיק מקום בשולחן ${table.number}: נותרו ${Math.max(free, 0)} מקומות, וההזמנה "${guest.name}" כוללת ${guest.count} מוזמנים.`
      );
      return;
    }
    onAssign(guestId, tableId);
  };

  const closeModal = () => setModal({ open: false, table: null });

  const handleTableSubmit = (list) => {
    if (modal.table) onUpdateTable(modal.table.id, list[0]);
    else onAddTables(list);
    closeModal();
  };

  const handleDeleteTable = (table) => {
    const seated = guestsAt(table.id).length;
    const msg = seated
      ? `למחוק את שולחן ${table.number}? ${seated} הזמנות ישוחררו וחוזרות לרשימת הממתינים.`
      : `למחוק את שולחן ${table.number}?`;
    if (window.confirm(msg)) onDeleteTable(table.id);
  };

  const handleExport = () => {
    const tableNumberOf = (g) => tables.find((t) => t.id === g.tableId)?.number;

    const byTable = sortedTables.flatMap((t) =>
      guestsAt(t.id).map((g) => ({
        שולחן: t.number,
        'שם המוזמן / משפחה': g.name,
        כמות: g.count,
        צד: SIDES[g.side]?.short ?? '',
        קרבה: g.category,
      }))
    );

    const alphabetical = [...confirmed].sort(byHebrewName).map((g) => ({
      'שם המוזמן / משפחה': g.name,
      כמות: g.count,
      שולחן: isSeated(g) ? tableNumberOf(g) : 'לא שובץ',
    }));

    const summary = sortedTables.map((t) => {
      const occupied = occupiedOf(t.id);
      return { שולחן: t.number, מקומות: t.capacity, תפוסה: occupied, פנויים: t.capacity - occupied };
    });

    exportSheets('סידורי_הושבה.xlsx', [
      {
        name: 'לפי שולחנות',
        rows: byTable,
        header: ['שולחן', 'שם המוזמן / משפחה', 'כמות', 'צד', 'קרבה'],
        widths: [10, 30, 10, 10, 14],
      },
      {
        name: 'לפי אלף-בית',
        rows: alphabetical,
        header: ['שם המוזמן / משפחה', 'כמות', 'שולחן'],
        widths: [30, 10, 12],
      },
      {
        name: 'סיכום שולחנות',
        rows: summary,
        header: ['שולחן', 'מקומות', 'תפוסה', 'פנויים'],
        widths: [10, 10, 10, 10],
      },
    ]);
  };

  const maxNumber = tables.reduce((m, t) => Math.max(m, t.number), 0);
  const lastCapacity = sortedTables.length ? sortedTables[sortedTables.length - 1].capacity : 10;

  return (
    <>
      <PageHeader
        title="סידורי הושבה"
        subtitle="גררו מוזמנים שאישרו הגעה אל השולחנות, או שייכו אותם מתוך הרשימה"
      >
        <button type="button" className="btn-export" onClick={handleExport} disabled={!tables.length}>
          <DownloadIcon />
          ייצוא לאקסל
        </button>
        <button type="button" className="btn-primary" onClick={() => setModal({ open: true, table: null })}>
          <PlusIcon />
          הוספת שולחנות
        </button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="סך המקומות" value={totalSeats} hint={`${tables.length} שולחנות`} />
        <StatCard label="מקומות פנויים" value={freeSeats} tone="emerald" hint="בכל השולחנות" />
        <StatCard label="שובצו" value={seatedPeople} tone="rose" hint="מוזמנים בשולחנות" />
        <StatCard
          label="ממתינים לשיבוץ"
          value={waitingPeople}
          tone={waitingPeople > 0 ? 'amber' : 'emerald'}
          hint={waitingPeople > 0 ? 'שאישרו הגעה' : 'הכול שובץ'}
        />
      </div>

      {notice && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <UnassignedList
          guests={unassigned}
          tables={sortedTables}
          occupiedOf={occupiedOf}
          confirmedTotal={confirmed.length}
          onAssign={tryAssign}
          onDropToList={(guestId) => onAssign(guestId, null)}
        />

        <section aria-label="שולחנות">
          {sortedTables.length === 0 ? (
            <EmptyState
              title="עדיין לא הוגדרו שולחנות"
              text="הגדירו מספר שולחן וכמות מקומות מקסימלית. אפשר להוסיף כמה שולחנות ברצף בבת אחת."
            >
              <button
                type="button"
                className="btn-primary"
                onClick={() => setModal({ open: true, table: null })}
              >
                <PlusIcon />
                הוספת שולחנות
              </button>
            </EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedTables.map((t) => (
                <TableCard
                  key={t.id}
                  table={t}
                  guests={guestsAt(t.id)}
                  occupied={occupiedOf(t.id)}
                  onDropGuest={(guestId) => tryAssign(guestId, t.id)}
                  onUnassign={(guestId) => onAssign(guestId, null)}
                  onEdit={() => setModal({ open: true, table: t })}
                  onDelete={() => handleDeleteTable(t)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={modal.open}
        title={modal.table ? `עריכת שולחן ${modal.table.number}` : 'הוספת שולחנות'}
        onClose={closeModal}
      >
        <TableForm
          table={modal.table}
          defaults={{ number: maxNumber + 1, capacity: lastCapacity }}
          existingNumbers={tables.filter((t) => t.id !== modal.table?.id).map((t) => t.number)}
          onSubmit={handleTableSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
