import { PencilIcon, TrashIcon, WhatsAppIcon } from '../common/Icons';
import { MEALS, RSVP, SIDES } from '../../utils/constants';
import { mealsOf } from '../../utils/guestStats';
import { whatsappLink } from '../../utils/whatsapp';

function MealChips({ guest }) {
  const m = mealsOf(guest);
  const special = Object.keys(MEALS).filter((k) => m[k] > 0);
  if (special.length === 0) return <span className="text-stone-400">רגילה</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {special.map((k) => (
        <span
          key={k}
          className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
        >
          {MEALS[k].label} ×{m[k]}
        </span>
      ))}
      {m.regular > 0 && <span className="text-xs text-stone-400">+ {m.regular} רגילות</span>}
    </div>
  );
}

export default function GuestTable({ guests, onEdit, onDelete, onRsvpChange }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="th">שם</th>
              <th className="th">פלאפון</th>
              <th className="th">כמות</th>
              <th className="th">אישור הגעה</th>
              <th className="th">קרבה</th>
              <th className="th">תזונה / ילדים</th>
              <th className="th">צד</th>
              <th className="th w-24">
                <span className="sr-only">פעולות</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {guests.map((g) => {
              const wa = whatsappLink(g.phone);
              return (
                <tr key={g.id} className="hover:bg-stone-50/60">
                  <td className="td font-medium">{g.name}</td>
                  <td className="td whitespace-nowrap tabular-nums">
                    {g.phone ? (
                      <span className="inline-flex items-center gap-2">
                        <a
                          href={`tel:${g.phone.replace(/[^\d+]/g, '')}`}
                          dir="ltr"
                          className="text-stone-700 hover:text-rose-600 hover:underline"
                        >
                          {g.phone}
                        </a>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="שליחת הודעה בוואטסאפ"
                            aria-label={`שליחת הודעה בוואטסאפ ל${g.name}`}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <WhatsAppIcon width={18} />
                          </a>
                        )}
                      </span>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </td>
                  <td className="td tabular-nums">{g.count}</td>
                  <td className="td">
                    <select
                      value={g.rsvp}
                      onChange={(e) => onRsvpChange(g.id, e.target.value)}
                      aria-label={`סטטוס הגעה של ${g.name}`}
                      className={`cursor-pointer rounded-full border-0 py-1 ps-3 pe-8 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 ${RSVP[g.rsvp]?.badge}`}
                    >
                      {Object.entries(RSVP).map(([key, r]) => (
                        <option key={key} value={key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="td text-stone-600">{g.category}</td>
                  <td className="td">
                    <MealChips guest={g} />
                  </td>
                  <td className="td">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        SIDES[g.side]?.badge ?? 'bg-stone-100 text-stone-600 ring-stone-200'
                      }`}
                    >
                      {SIDES[g.side]?.label ?? '—'}
                    </span>
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => onEdit(g)}
                        aria-label={`עריכת ${g.name}`}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => onDelete(g)}
                        aria-label={`מחיקת ${g.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
