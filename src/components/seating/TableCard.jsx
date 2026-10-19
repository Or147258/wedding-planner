import { useState } from 'react';
import { CloseIcon, PencilIcon, TrashIcon } from '../common/Icons';
import { SIDES } from '../../utils/constants';
import { startGuestDrag } from '../../utils/dnd';

// נקודה לכל מקום ישיבה: מלא = תפוס, ריק = פנוי, אדום = חריגה מהקיבולת
function SeatDots({ capacity, occupied }) {
  const total = Math.max(capacity, occupied);
  return (
    <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        let cls = 'border-stone-300 bg-white';
        if (i >= capacity) cls = 'border-red-500 bg-red-500';
        else if (i < occupied) cls = 'border-rose-500 bg-rose-500';
        return <span key={i} className={`h-3.5 w-3.5 rounded-full border ${cls}`} />;
      })}
    </div>
  );
}

export default function TableCard({ table, guests, occupied, onDropGuest, onUnassign, onEdit, onDelete }) {
  const [over, setOver] = useState(false);
  const free = table.capacity - occupied;

  let status = `${free} מקומות פנויים`;
  let statusCls = 'text-emerald-600';
  if (free < 0) {
    status = `חריגה של ${-free} מקומות`;
    statusCls = 'text-red-600';
  } else if (free === 0) {
    status = 'מלא';
    statusCls = 'text-amber-600';
  }

  return (
    <div
      className={`card flex flex-col p-4 transition ${over ? 'bg-rose-50/50 ring-2 ring-rose-400' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDropGuest(e.dataTransfer.getData('text/plain'));
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">שולחן {table.number}</h3>
          <p className={`text-xs font-medium ${statusCls}`}>{status}</p>
        </div>
        <div className="flex">
          <button
            type="button"
            className="btn-icon"
            onClick={onEdit}
            aria-label={`עריכת שולחן ${table.number}`}
          >
            <PencilIcon width={16} height={16} />
          </button>
          <button
            type="button"
            className="btn-icon-danger"
            onClick={onDelete}
            aria-label={`מחיקת שולחן ${table.number}`}
          >
            <TrashIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs tabular-nums text-stone-500">
        {occupied} מתוך {table.capacity} מקומות
      </p>
      <SeatDots capacity={table.capacity} occupied={occupied} />

      <ul className="mt-3 flex-1 space-y-1.5">
        {guests.length === 0 && (
          <li className="rounded-lg border border-dashed border-stone-300 px-3 py-4 text-center text-xs text-stone-400">
            גררו לכאן מוזמנים
          </li>
        )}
        {guests.map((g) => (
          <li
            key={g.id}
            draggable
            onDragStart={(e) => startGuestDrag(e, g.id)}
            className="flex cursor-grab items-center gap-2 rounded-lg bg-stone-50 px-2.5 py-1.5 text-sm active:cursor-grabbing"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${SIDES[g.side]?.dot}`} />
            <span className="flex-1 truncate">{g.name}</span>
            {g.count > 1 && (
              <span className="rounded-full bg-white px-1.5 text-xs tabular-nums text-stone-500 ring-1 ring-inset ring-stone-200">
                {g.count}
              </span>
            )}
            <button
              type="button"
              className="text-stone-400 hover:text-red-600"
              onClick={() => onUnassign(g.id)}
              aria-label={`הסרת ${g.name} מהשולחן`}
            >
              <CloseIcon width={14} height={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
