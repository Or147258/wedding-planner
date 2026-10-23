import { RSVP, SIDES } from '../constants';

const FILTERS = [{ id: 'all', label: 'הכל' }, ...Object.entries(SIDES).map(([id, s]) => ({ id, label: s.label }))];

const people = (list) => list.reduce((sum, g) => sum + (Number(g.count) || 0), 0);

// כפתורי סינון + טבלת המוזמנים. guests = כל הרשימה; הסינון נעשה כאן.
export default function GuestList({ guests, filter, onFilter, onEdit, onDelete, onRsvp }) {
  const visible = filter === 'all' ? guests : guests.filter((g) => g.side === filter);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="סינון לפי צד">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = people(f.id === 'all' ? guests : guests.filter((g) => g.side === f.id));
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => onFilter(f.id)}
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

      {visible.length === 0 ? (
        <div className="card px-6 py-14 text-center text-sm text-stone-500">
          {guests.length === 0 ? 'עדיין אין מוזמנים. לחצו על "הוספת מוזמן".' : 'אין מוזמנים בצד שנבחר.'}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-start">שם</th>
                  <th className="px-4 py-3 text-start">טלפון</th>
                  <th className="px-4 py-3 text-start">כמות</th>
                  <th className="px-4 py-3 text-start">צד</th>
                  <th className="px-4 py-3 text-start">קטגוריה</th>
                  <th className="px-4 py-3 text-start">אישור הגעה</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">פעולות</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((g) => (
                  <tr key={g.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium">{g.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {g.phone ? (
                        <a
                          href={`tel:${g.phone.replace(/[^\d+]/g, '')}`}
                          dir="ltr"
                          className="hover:text-rose-600 hover:underline"
                        >
                          {g.phone}
                        </a>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{g.count}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          SIDES[g.side]?.badge ?? 'bg-stone-100 text-stone-600 ring-stone-200'
                        }`}
                      >
                        {SIDES[g.side]?.label ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{g.category}</td>
                    <td className="px-4 py-3">
                      <select
                        value={g.rsvp}
                        onChange={(e) => onRsvp(g.id, e.target.value)}
                        aria-label={`סטטוס הגעה של ${g.name}`}
                        className={`cursor-pointer rounded-full border-0 py-1 ps-3 pe-8 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 ${
                          RSVP[g.rsvp]?.badge
                        }`}
                      >
                        {Object.entries(RSVP).map(([key, r]) => (
                          <option key={key} value={key}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-end">
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                        onClick={() => onEdit(g)}
                      >
                        עריכה
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-stone-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => onDelete(g)}
                      >
                        מחיקה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {visible.length > 0 && (
        <p className="mt-3 text-sm text-stone-500">
          מוצגות {visible.length} הזמנות · {people(visible)} מוזמנים
        </p>
      )}
    </>
  );
}
