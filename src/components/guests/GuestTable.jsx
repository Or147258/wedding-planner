import { PencilIcon, TrashIcon } from '../common/Icons';
import { RSVP, SIDES } from '../../utils/constants';

export default function GuestTable({ guests, onEdit, onDelete, onRsvpChange }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="th">שם המוזמן / משפחה</th>
              <th className="th">כמות</th>
              <th className="th">צד</th>
              <th className="th">קרבה</th>
              <th className="th">אישור הגעה</th>
              <th className="th w-24">
                <span className="sr-only">פעולות</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {guests.map((g) => (
              <tr key={g.id} className="hover:bg-stone-50/60">
                <td className="td font-medium">{g.name}</td>
                <td className="td tabular-nums">{g.count}</td>
                <td className="td">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${SIDES[g.side]?.badge}`}
                  >
                    {SIDES[g.side]?.label}
                  </span>
                </td>
                <td className="td text-stone-600">{g.category}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
