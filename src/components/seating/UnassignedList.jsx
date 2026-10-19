import { useState } from 'react';
import { SearchIcon } from '../common/Icons';
import { SIDES } from '../../utils/constants';
import { startGuestDrag } from '../../utils/dnd';
import { sumBy } from '../../utils/helpers';

export default function UnassignedList({
  guests,
  tables,
  occupiedOf,
  confirmedTotal,
  onAssign,
  onDropToList,
}) {
  const [query, setQuery] = useState('');
  const [over, setOver] = useState(false);

  const q = query.trim();
  const list = guests.filter((g) => !q || g.name.includes(q));

  return (
    <aside
      className={`card flex flex-col p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:self-start ${
        over ? 'ring-2 ring-rose-400' : ''
      }`}
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
        onDropToList(e.dataTransfer.getData('text/plain'));
      }}
    >
      <h2 className="font-semibold">ממתינים לשיבוץ</h2>
      <p className="text-xs text-stone-500">
        {sumBy(guests, (g) => g.count)} מוזמנים · {guests.length} הזמנות (רק מי שאישרו הגעה)
      </p>

      {guests.length > 0 && (
        <div className="relative mt-3">
          <SearchIcon
            width={16}
            height={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            className="input ps-9"
            placeholder="חיפוש…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="חיפוש מוזמן לשיבוץ"
          />
        </div>
      )}

      <ul className="mt-3 space-y-2 overflow-y-auto">
        {confirmedTotal === 0 && (
          <li className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500">
            אין עדיין מוזמנים שאישרו הגעה. עדכנו סטטוס בדף{' '}
            <a href="#guests" className="font-medium text-rose-600 underline">
              המוזמנים
            </a>
            .
          </li>
        )}
        {confirmedTotal > 0 && guests.length === 0 && (
          <li className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
            כל המוזמנים שאישרו הגעה שובצו לשולחנות 🎉
          </li>
        )}
        {list.map((g) => (
          <li
            key={g.id}
            draggable
            onDragStart={(e) => startGuestDrag(e, g.id)}
            className="cursor-grab rounded-xl border border-stone-200 bg-white p-3 active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${SIDES[g.side]?.dot}`} />
              <span className="flex-1 truncate text-sm font-medium">{g.name}</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs tabular-nums">{g.count}</span>
            </div>
            <p className="mt-0.5 text-xs text-stone-500">
              {g.category} · {SIDES[g.side]?.short}
            </p>
            <select
              value=""
              onChange={(e) => e.target.value && onAssign(g.id, e.target.value)}
              disabled={tables.length === 0}
              aria-label={`שיוך ${g.name} לשולחן`}
              className="input mt-2 py-1.5 text-xs"
            >
              <option value="">
                {tables.length === 0 ? 'הוסיפו שולחנות קודם' : 'שייך לשולחן…'}
              </option>
              {tables.map((t) => {
                const free = t.capacity - occupiedOf(t.id);
                return (
                  <option key={t.id} value={t.id} disabled={free < g.count}>
                    שולחן {t.number} ({Math.max(free, 0)} פנויים)
                  </option>
                );
              })}
            </select>
          </li>
        ))}
      </ul>
    </aside>
  );
}
